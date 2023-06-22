var {
    INIT_PROCESS_DBCONNECTION_CHECK,
    INIT_PROCESS_DBCONNECTION_TEST_OK,
    INIT_PROCESS_DBCONNECTION_TEST_FAILED,
    INIT_PROCESS_ERROR,
} = require('../../utilities/constants');
var fs = require('fs');
var async = require('async');

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

module.exports = initProcessController;