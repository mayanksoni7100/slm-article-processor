const MongoClient = require('mongodb').MongoClient;
var format = require('string-template');
const mongodbName = process.env.NOSQL_DB_NAME;
let mongodbUrl = `mongodb://${process.env.NOSQL_USERNAME}:${process.env.NOSQL_PASSWORD}@{HOSTINFO}/?authSource=${process.env.NOSQL_AUTH_DB}`;

if(process.env.NOSQL_PORT){
    let mongodbHosts = process.env.NOSQL_HOST.split(',');
    let mongodbPorts = process.env.NOSQL_PORT.split(',');

    let hostInfo = '';
    for(var data = 0; data < mongodbHosts.length; data++){
        if(hostInfo){
            hostInfo += `,${mongodbHosts[data]}:${mongodbPorts[data]}`;
        }else{
            hostInfo = `${mongodbHosts[data]}:${mongodbPorts[data]}`;
        }
    }
    mongodbUrl = format(mongodbUrl, {
        HOSTINFO : hostInfo
    });

    /* If Local connection */
    if(process.env.NOSQL_HOST == 'localhost'){
        mongodbUrl = 'mongodb://'+process.env.NOSQL_HOST+':'+process.env.NOSQL_PORT+'/';
    }
}else{
    mongodbUrl = `mongodb+srv://${process.env.NOSQL_USERNAME}:${process.env.NOSQL_PASSWORD}@${process.env.NOSQL_HOST}/${mongodbName}?retryWrites=true&w=majority&serverSelectionTimeoutMS=60000`;
}


logger.info('MongoDB URL:' + mongodbUrl);

let mongoOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    poolSize: parseInt(process.env.NOSQL_MAX_POOL_SIZE),
    //connectTimeoutMS: 30000,
    //reconnectTries: 30,
    //appname: process.env.RDMBS_CONN_NAME,
    ssl: process.env.NOSQL_SSL_STATE
};

if(!process.env.NOSQL_PORT){
    mongoOptions = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        poolSize: parseInt(process.env.NOSQL_MAX_POOL_SIZE),
        //connectTimeoutMS: 30000,
        //reconnectTries: 30,
        //appname: process.env.RDMBS_CONN_NAME
    };
}

global.nosql_info = null;
export function mongodbConnection() {
    return new Promise(resolve => {
        try{
            MongoClient.connect(mongodbUrl, mongoOptions, async function(err, db) {
                if (err) {
                    logger.error('MongoDB Connection failed can not do any data operations with mongo db');
                    logger.error(err);
                    global.nosql_info = null;
                    resolve(false);
                }else{
                    logger.info('MongoDB Connection Successful.');
                    global.nosql_info = db.db(mongodbName);
                    global.nosql_info["admin"] = await db.db().admin();
                    resolve(true);
                }
            })
        }catch(err){
            logger.error(`MongoDB Database Connection Error`);
            logger.error(err);
            resolve(false);
        }
    });
}

async function createCollection(collectionName){
    return new Promise(resolve => {
        try{
            global.nosql_info.createCollection(collectionName, function(err, result) {
                if (err) {
                    logger.error(`Mongo DB Collection ${collectionName} creation failed`);
                    logger.error(err);
                    resolve(false);
                } else {
                    logger.info(`Mongo DB Collection ${collectionName} created successfully`);
                    resolve(true);
                }
            });
        }catch(err){
            logger.error('While creating the collections');
            logger.error(err);
            resolve(false);
        }
    });
}

// module.exports = mongodbConnection;
