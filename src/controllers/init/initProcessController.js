var {
    INIT_PROCESS_DBCONNECTION_CHECK,
    INIT_PROCESS_DBCONNECTION_TEST_OK,
    INIT_PROCESS_DBCONNECTION_TEST_FAILED,
    INIT_PROCESS_ERROR,
} = require('../../utilities/constants');
var fs = require('fs');
var async = require('async');
const { getNamespace } = require('cls-hooked');
const { getConnectionBycustomerCode } = require('../../repository/postgres/handlers/dbConnection');

function initProcessController() {
}

initProcessController.prototype.doInitProcess = function (callback) {
    async.series(
        [
            function (rdbmsConnectionCallback) {
                logger.info(`1. ${process.env.RDBMS_TYPE} ${INIT_PROCESS_DBCONNECTION_CHECK}`);
                var idx = 0;
                var sql = fs.readFileSync(`${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/init/connectionCheck.sql`, 'utf8');
                var dbHandler = new (require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
                dbHandler.executeCommand(sql, idx);
                dbHandler.execSerise(function (result) {
                    if (result.code == 1) {
                        logger.info(INIT_PROCESS_DBCONNECTION_TEST_OK);
                        rdbmsConnectionCallback(null, 'success');
                    } else {
                        logger.error(INIT_PROCESS_DBCONNECTION_TEST_FAILED);
                        rdbmsConnectionCallback(result.data, 'error');
                    }
                });
            }
        ],
        function (err, results) {
            var initResponse = {};
            initResponse['code'] = 1;
            for (var res = 0; res < results.length; res++) {
                if (results[res] === 'error') {
                    initResponse.code = -1;
                }
            }
            if (err) {
                logger.error(INIT_PROCESS_ERROR);
                logger.error(err);
            }
            callback(initResponse);
        }
    );
};


initProcessController.prototype.initializeDefaults = function(){
    return new Promise(async resolve => {
        try{
            /* Generating Pickcel Service Base URL */
            if (process.env.PICKCEL_SERVICE_ENABLED == 'YES') {
                process.env.PICKCEL_BASE_URL = `${process.env.PICKCEL_SERVICE_PROTOCOL}://${process.env.PICKCEL_SERVICE_HOST}${process.env.PICKCEL_SERVICE_PORT ? `:${process.env.PICKCEL_SERVICE_PORT}` : ''}${process.env.PICKCEL_SERVICE_SUB_DOMAIN ? `/${process.env.PICKCEL_SERVICE_SUB_DOMAIN}` : ''}`;
            }

            /* Generating LBS Service Base URL */
            if (process.env.LCD_ENABLED == 'YES') {
                process.env.LCD_BASE_URL = `${process.env.LCD_SERVICE_PROTOCOL}://${process.env.LCD_SERVICE_HOST}${process.env.LCD_SERVICE_PORT ? `:${process.env.LCD_SERVICE_PORT}` : ''}${process.env.LCD_SERVICE_SUB_DOMAIN ? `/${process.env.LCD_SERVICE_SUB_DOMAIN}` : ''}`;
            }

            let eventHubController = new(require('../../controllers/cloud/azure/articleProcessorEventHubReceiverController'))();
            eventHubController.receiveEvents({ operationType: "start" }, result => {
                logger.info(`Article Process Consumer Status: ${result.msg}`);
            });

            resolve(true);
        }catch(intializationError){
            logger.error('API Service initializeDefaults Error');
            logger.error(intializationError);
            resolve(false);
        }
    });
}

function processAdditionalArticleQueue(job){
    return new Promise(async resolve => {
        let nameSpace = getNamespace('api_service_unique_context');
        nameSpace.run(async() => {
            nameSpace.set('connection', getConnectionBycustomerCode(job.data.customerCode));
            let articleQueueProcessors = new(require('../queue/articleQueueProcessor'))();
            await articleQueueProcessors.processQueue(job);
            resolve(true);
            return;
        });
    });
}

global.processArticleProcessEventHub = function(job) {
    return new Promise(async resolve => {
        try{
            logger.info(`Customer: ${job.data.customerCode}, Store: ${job.data.storeCode}, Transaction Sequence: ${job.data.txSequence}, JobId: ${job.id} - Started Processing`);
            await processAdditionalArticleQueue(job);
            logger.info(`Customer: ${job.data.customerCode}, Store: ${job.data.storeCode}, Transaction Sequence: ${job.data.txSequence}, JobId: ${job.id} - Completed Processing`);
           
            // logger.info(`${QUEUE_ARTICLE} - [ARTICLE] Customer: ${job.data.customerCode}, Store: ${job.data.storeCode}, Transaction Sequence: ${job.data.txSequence}, JobId: ${job.id} - Pushing data to article event queue - INPROGRESS`);
            // global.pushDatatoEventArticleQueue(job.data);
            // logger.info(`${QUEUE_ARTICLE} - [ARTICLE] Customer: ${job.data.customerCode}, Store: ${job.data.storeCode}, Transaction Sequence: ${job.data.txSequence}, JobId: ${job.id} - Pushing data to article event queue - COMPLETED`);
    
    
            // /* Metrics - Maintaing Article Queue Count */
            // if(process.env.METRICS_ENABLED == 'YES'){
            //     try{
            //         totalArticleEventQueueJobs.labels(process.env.CODE_HOST_NAME, job.data.customerCode).inc();
            //     }catch(metricsAddError){
            //         logger.error(`Metrics Error - While adding the metrics for Article event Queue count`, {customer: job.data.customerCode});
            //         logger.error(metricsAddError);
            //     } 
            // }
            resolve(true);
        }catch(err){
            logger.error('Article Process Event hub - Processing Error');
            logger.error(err);
            resolve(false);
        }
    });
}

module.exports = initProcessController;