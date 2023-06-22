import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import requestIp from 'request-ip';
import fs from 'fs';
import errorHandler from './middlewares/errorHandler';
import logResponse from './middlewares/responseHandler';
import applicationLogger from './config/applicationLogger.js';
import envVariables from './config/envVariables';
import aboutAPI from './api/about/aboutAPI.js';
import publicAPI from './api/public/publicAPI.js'
import helmet from 'helmet';
import rTracer from 'cls-rtracer';
import YAML from 'yamljs';
import creatreSwaggerCustomCss from './utilities/swaggerCustomCss'
import {
    LOG_SEPERATION_AT_SIGN,
    SERVER_START,
    SERVER_STARTING_SQUAREPOS_SERVICE,
    SERVER_STOP,
    ARTICLE_PROCESS_EVENTHUB_CONSUMER_STOPPED_ON_APP_CLOSE
} from "./utilities/constants";

global.articleQueue = '';
global.articleQueueMap = new Map();
global.articleQueueOptions = {
    attempts: 2, // If job fails it will retry till 5 times
    backoff: 2000 // static 2 sec delay between retry
};
global.squareCustomerCatalogFetchDetails = {};
/* Declaring App */
var app = express();

/* Helmet will provide default security headers */
app.use(helmet());

app.use(helmet({
    frameguard: {
        action: 'sameorigin'
    }
}));

/* If service is running under any load balancer like nginx */
app.set('trust proxy', true);

/* adding middleware to get the request ip */
app.use(requestIp.mw());

/* Setting Request Size Limit */
app.use(express.json({
    limit: '25mb'
}));
app.use(express.urlencoded({
    limit: '25mb',
    extended: true
}));

/* Adding Body Parser */
app.use(bodyParser.json());

/* CORS Support */
app.use(cors({
    exposedHeaders: ['*']
}));

// Loading Environment Variables
envVariables();

// Logger declaration
applicationLogger(rTracer);

/* For Development Purpose */
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

/* Log incoming request */
const addRtracerId = (req, res, next) => {
    /* Adding Request Date when received request */
    req.requestDate = new Date();
    /* Assigning unique Id for each request */
    req.reqUniqueId = rTracer.id();
    let postBody = req.body;
    logger.info(`${req.method} ${req.url}, data: ${JSON.stringify(postBody)}`);
    res.header('Access-Control-Allow-Headers', '*');
    res.set('Content-Security-Policy', "frame-ancestors 'none';");
    next();
    return;
}

/* rTracer Middleware */
app.use(rTracer.expressMiddleware());
app.use(addRtracerId)
app.use(logResponse);

/* Logging client ip */
const logClientIp = (req, res, next) => {
    let requestIPAddress = req.header('requested-client-ip') || req.connection.remoteAddress;
    logger.info(`Client IP address(Requested-Client-IP): ${requestIPAddress}`);
    req.requestIPAddress = requestIPAddress;
    next();
    return;
}

app.use(logClientIp, function (req, res, next) {
    logger.info(`${req.method} ${req.url}, data: ${JSON.stringify(req.body)}`);
    res.header('Access-Control-Allow-Headers', '*');
    res.set('Content-Security-Policy', "frame-ancestors 'none';");
    next();
    return;
});


/* Including all Secured Routes */
var securedAPIs = [];
securedAPIs.push(aboutAPI);
securedAPIs.push(publicAPI);

/* Images */
app.use('/img', express.static('assets/img'));

app.use('/manuals', express.static('saasdocs'));


/* Swagger Documention - Start */
app.use(express.static('swagger'));
app.use(express.static('assets'));
app.use(express.static('./src/swagger_defination'));
let swaggerBasePath = '';
if (process.env.SUB_DOMAIN != '') {
    swaggerBasePath = `/${process.env.SUB_DOMAIN}/api`;
} else {
    swaggerBasePath = `/api`;
}

app.locals.swaggerBasePath = swaggerBasePath;

let baseVersion = process.env.base_version_string ? process.env.base_version_string : '1.0.0';
let squarePosServiceVersion = process.env.squarepos_version_info ? process.env.squarepos_version_info : '0';

/* open api 3.0 - start */
const swaggerUi = require('swagger-ui-express');
const yamlSpecFile = `${process.cwd()}/src/swagger_defination/OpenAPI3.0v1.yaml`;
const apiDefinition = YAML.load(yamlSpecFile)
apiDefinition.info.version = `${baseVersion}.${squarePosServiceVersion}`;
if(!process.env.SUB_DOMAIN){
    apiDefinition.servers[0].url = '/';
    apiDefinition.servers[0].description = '';
}
try {
    fs.writeFileSync(`${process.cwd()}/assets/swaggerDefinition.json`, JSON.stringify(apiDefinition));
} catch (error) {
    logger.error('Customer Level Swagger Defination json Generation Failed');
    logger.error(error);
}

let yamlBaseUrl = `https://${process.env.SQUAREPOS_SERVICE_HOST}:${process.env.PORT}`;
let swaggerHeaderLogo = '';
let swaggerHeaderTabChangeJs = '';
if (process.env.SUB_DOMAIN) {
    yamlBaseUrl = `https://${process.env.SQUAREPOS_SERVICE_HOST}${process.env.SUB_DOMAIN ? `/${process.env.SUB_DOMAIN}` : ''}`;
    swaggerHeaderLogo = `/${process.env.SUB_DOMAIN}`;
    swaggerHeaderTabChangeJs = `${yamlBaseUrl}/manuals/js/swaggerTabChanges.js`;
}else{
    yamlBaseUrl = 'http://localhost:8095'
    swaggerHeaderLogo = '';
    swaggerHeaderTabChangeJs = `/manuals/js/swaggerTabChanges_local.js`;
}

app.get('/', function (req, res) {
        res.redirect(`/api/`);
});

app.use('/docs/', swaggerUi.serve, function (req, res, next) {
    let options = {
        explorer: true,
        customJs: swaggerHeaderTabChangeJs,
        customCss: creatreSwaggerCustomCss(swaggerHeaderLogo),
        
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            docExpansion: "none",
            apisSorter: "alpha",
            operationsSorter: 'alpha',
            tagsSorter: 'alpha',
            filter: true,
            validatorUrl: 'none',
            urls: [
                {
                  url:  `${yamlBaseUrl}/swaggerDefinition.json`,
                  name: 'API Documentation'
                }
              ]
        }
    };
    app.use(swaggerUi.setup(null, options));
    next();
    return;
});

/* Adding All routes */
app.use('/api', securedAPIs);

/* Starting article processor Service */
var squarePosServiceServer = null;

async function startServer() {
    let initProcess = new(require('./controllers/init/initProcessController'))();
    let initResult =  await initProcess.initializeDefaults();
    squarePosServiceServer = http.createServer(app).listen(process.env.PORT, async () => {
        logger.info(`${LOG_SEPERATION_AT_SIGN} ${SERVER_START}${process.env.PORT}) ${LOG_SEPERATION_AT_SIGN}`);
    });
}


/* initializing the start process of article processor Service */
async function initializeStartProcess(){
    /* Databse connection initialization */
    let { dbConnection } = require(`./repository/${process.env.RDBMS_TYPE}/handlers/dbConnection`);
    logger.info('Initializing PostgreSQL Connection');
    await dbConnection();
    logger.info('Initialization of PostgreSQL Connection Completed');
    
    
    logger.info('Initializing MongoDB Connection');
    let { mongodbConnection } = require(`./repository/${process.env.NOSQL_TYPE}/handlers/dbConnection`);
    await mongodbConnection();
    logger.info('Initialization of MongoDB Connection Completed');
    logger.info(SERVER_STARTING_SQUAREPOS_SERVICE);
    startServer();
}

initializeStartProcess();

/* Middlware for Global Error Handler */
app.use(errorHandler);

/* Service Stop Events */
process.on('message', () => {
    stopServer();
});

process.on('SIGINT', () => {
    stopServer();
});

process.on('SIGTERM', () => {
    stopServer();
});


async function stopServer() {
    logger.info(`article processor Service stop command received.`);
    if(squarePosServiceServer) {
        logger.info('Closing http server to stop receiveing API calls');
        squarePosServiceServer.close(() => {
            logger.info('Http server closed, no more API calls will be received');
        });
    }
    if(global.articleProcessEventSubscription && global.articleProcessEventConsumerClient){
        try{
            await global.articleProcessEventSubscription.close();
            await global.articleProcessEventConsumerClient.close();
            global.articleProcessEventSubscription = '';
            global.articleProcessEventConsumerClient = '';
            logger.info(`[SIGTERM] - ${ARTICLE_PROCESS_EVENTHUB_CONSUMER_STOPPED_ON_APP_CLOSE}`);
        }catch (err) {
            logger.warn(`[SIGTERM] - Could not close Article Process event hub receivers`);
        }
    }
    logger.info(`${LOG_SEPERATION_AT_SIGN} ${SERVER_STOP} ${LOG_SEPERATION_AT_SIGN}`);
    process.exit();
}
