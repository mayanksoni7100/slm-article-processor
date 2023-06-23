let mongodbHandler;
var {
  NOSQL_CLCTN_L_PICKCEL_EVENT_LOGS
} = require('../../../utilities/constants');

function lcdOperationsControllerNoSQL() {
    mongodbHandler = new(require(`../../../repository/${process.env.NOSQL_TYPE}/handlers/dbHandler`))();
}

lcdOperationsControllerNoSQL.prototype.insertLCDArticlesLog = function(customerCode, docsToInsert) {
    return new Promise(resolve => {
        (async () => {
            try {
                let lcdArticlesHandler = new(require(`../../../repository/${process.env.NOSQL_TYPE}/handlers/dbHandler`))();
                let finalDocuments = [];
                for (let doc of docsToInsert) {
                    finalDocuments.push({
                      ...doc,
                      insertTime: new Date()
                    });
                }
                logger.info(`[${customerCode}] - [LCD_CONTROLLER_NOSQL] - Started inserting LCD articles log data in mongo db and articles count: ${finalDocuments.length}`);
                let result = await lcdArticlesHandler.insertManyDocuments(`${customerCode}.${NOSQL_CLCTN_L_PICKCEL_EVENT_LOGS}`, finalDocuments);
                logger.info(`[${customerCode}] - [LCD_CONTROLLER_NOSQL] - Completed inserting LCD articles log data in mongo db and articles count: ${finalDocuments.length}`);
                if (result.code == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                logger.error(`[${customerCode}] - [LCD_CONTROLLER_NOSQL] - Error while inserting LCD articles log data in mongo db and articles count: ${finalDocuments.length}`);
                logger.error(error);
                resolve(false);
            }
        })();
    });
}

module.exports = lcdOperationsControllerNoSQL;