var fs = require('fs');
require('moment-duration-format');
var dbHandler;
const axios = require('axios');
function lcdOperationsController() {
    dbHandler = new(require(`../../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
    dbHandlerNoSQL = new(require(`../../../repository/${process.env.NOSQL_TYPE}/handlers/dbHandler`))();
    return this;
}

var executeParallel = function () {
    // It's Promise
    return new Promise(function (resolved, rejected) {
        dbHandler.execParallel(function (result) {
            resolved(result);
        });
    });
};

lcdOperationsController.prototype.getLcdArticlesByArticleIds = function(articleIds, customerId, storeId) {
    return new Promise(resolve => {
        getLcdArticlesByArticleIds_db(articleIds, customerId, storeId).then(function(){
            return executeParallel();
        }).then(async function(result) {
            if (result.code == 1) {
                logger.info('[LCD_CONTROLLER] - Successfully fetched mapped lcd articles from db');
            } else {
                logger.error('[LCD_CONTROLLER] - Error on fetching mapped lcd articles from db');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    });
}

function getLcdArticlesByArticleIds_db(articleIds, customerId, storeId) {
    var idx = 0;
    let path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/lcd-operations/getLcdArticlesByArticles.sql`;
    return new Promise(function (resolved, reject) {
        let sqlQuery = fs.readFileSync(path, 'utf8');
        let params = {
            articleIds: articleIds,
            customerId: customerId,
            storeId: storeId
        };

        dbHandler.executeCommandWithParams(sqlQuery, params, idx);
        idx++;
        resolved(true);
    });
}

lcdOperationsController.prototype.updateLcdArticlePickcelResult_Array = function(articleIds, storeId, customerId) { 
    return new Promise((resolve) => {
        let articleData = [];
        for (let article of articleIds) {
            let data = {
                articleId: article,
                result : 'N',
                articleUpdateTime: new Date()
            };
            articleData.push(data);
        }
        updateLcdArticlePickcelResult_db(articleData, storeId, customerId, '', 'update').then(function(){
            return executeParallel();
        }).then(function(result) {
            if (result.code == 1) {
                logger.info('[LCD_CONTROLLER] - Successfully updated LCD articles');
            } else {
                logger.error('[LCD_CONTROLLER] - Failed to update LCD articles');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    });
}

function updateLcdArticlePickcelResult_db(articleData, storeId, customerId, resultType, articleEvent) {           
    var idx = 0;
    // let insertLinkDataPath = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/lcd-operations/insertLinkData.sql`;

    return new Promise(function (resolved, reject) {
        // let insertQuery = fs.readFileSync(insertLinkDataPath, 'utf8');
        let params = {};
        let updateValue = "";
        let iterCount = 0;
        for (let article of articleData) {
            iterCount++;
            updateValue+= "update m_lcd_article set ";
            if (article.hasOwnProperty('articleUpdateTime') == true) {
                updateValue += 'article_update_time= ${article_update_time' +iterCount +  '},'; 
                params["article_update_time" + iterCount] =  article.articleUpdateTime;
            }
            if (article.hasOwnProperty('result') == true) {
                let result = article.result;
                if (resultType == 'updateResult' || articleEvent == 'update') {
                    updateValue += 'article_update_result=${article_update_result' +iterCount+ '},';
                    params["article_update_result" + iterCount] = result;
                } else if (resultType == 'deleteResult' || articleEvent == 'delete') {
                    updateValue += 'article_delete_result=${article_delete_result' + iterCount+'},';
                    params["article_delete_result" + iterCount] = result;
                } else {
                    updateValue += `article_update_result=null,article_delete_result=null,`;
                }
            }
            if (article.hasOwnProperty('lcdUpdateTime') == true && resultType != 'articleUpdateDelete') {
                updateValue += 'lcd_update_time=${lcd_update_time' +iterCount+'},';
                params["lcd_update_time" + iterCount] =  article.lcdUpdateTime;
            }
            updateValue = updateValue.slice(0,-1);
            updateValue += ' where customer_id = ${customer_id} and store_id = ${store_id} and article_id = ${article_id' +iterCount+  '};';
            params["article_id"+iterCount] = article.articleId;
        }
        params["customer_id"] = customerId;
        params["store_id"] = storeId;
        dbHandler.executeCommandWithParams(updateValue, params, idx);
        idx++;
        resolved(true);
    });
}

function waitForNextRetryForPickelDicamo(retryCount, integrationType) {
    let timeToWaitInMs = 2000;
    timeToWaitInMs = timeToWaitInMs * retryCount;
    return new Promise(resolve => setTimeout(resolve, timeToWaitInMs));
}

global.sendLCDArticlesPickcelDataToLoadBalancer = function(articleData, jobData, noticeType) {
    return new Promise(async resolve => {
        let retryCounter = 0;
        let isRetryCompleted = false;
        let isDataDelivered = false;
        let maxRetriesCount = 1; //process.env.PICKCEL_SERVICE_EVENT_UPDATE_RETRY_COUNT ? parseInt(process.env.PICKCEL_SERVICE_EVENT_UPDATE_RETRY_COUNT) : 2;        
        while (retryCounter <= maxRetriesCount) {
            try {
                logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter} - Started`);
                if (retryCounter == maxRetriesCount) {
                    isRetryCompleted = true;
                    logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter} - Completed`);
                }
                let apiResult = await callAPIandGetResultforLCDArticlesPickcel(articleData, jobData, retryCounter, noticeType);
                if (apiResult) {
                    isDataDelivered = true;
                    logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article Pickcel delivered to customer: ${jobData.customerCode}, store: ${jobData.storeCode} for retry count: ${retryCounter}`);
                    logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article Pickcel Retry Count: ${retryCounter} - Completed`);
                    break;
                } else {
                    logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data delivering to customer: ${jobData.customerCode}, store: ${jobData.storeCode} for retry count: ${retryCounter} failed, Retrying...`);
                }
                await waitForNextRetryForPickelDicamo(retryCounter, 'PICKCEL');
                retryCounter++;
            } catch (error) {
                logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Error in Retry Process while sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter}`);
                logger.error(error);
                retryCounter++;
            }
        }
        if (isDataDelivered) {
            resolve(true);
            return;
        } else {
            resolve(false);
            return;
        }
    });
}

function callAPIandGetResultforLCDArticlesPickcel(articleData, jobData, retryCounter, noticeType) {
    return new Promise(resolve => {
        let isDataSent = false;
        let articleUpdateBody = {
            eventType: noticeType,
            company: jobData.customerCode,
            storeId: jobData.storeCode,
            articleIds: articleData
        };
        let statusCode = '';
        let statusText = '';
        let urlToHit = `${process.env.PICKCEL_BASE_URL}` + '/api/v4/article/event/update?env=' + global.environmentName;
        logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data posting URL: ${urlToHit}`);
        axios.post(urlToHit, articleUpdateBody, {
            timeout: 1000 * 60,
            headers: {
                'x-auth-key': process.env.PICKCEL_SERVICE_AUTH_KEY,
                'x-auth-secret':process.env.PICKCEL_SERVICE_AUTH_SECRET
            }
        }).then(function (response) {
            isDataSent = true;
            statusCode = 200;
            statusText = 'SUCCESS';
            logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data successfully delivered to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with for retry count: ${retryCounter}`);
        }).catch(function (error) {
            logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data sending to customer: ${jobData.customerCode}, store: ${jobData.storeCode} failed for retry count: ${retryCounter}`);
            if (error.response) {
                /*
                * The request was made and the server responded with a
                * status code that falls out of the range of 2xx, 404
                */
                statusCode = error.response.status;
                statusText = error.response.data;
                logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                /*
                * The request was made but no response was received, `error.request`
                * is an instance of XMLHttpRequest in the browser and an instance
                * of http.ClientRequest in Node.js
                */
                statusCode = 500;
                statusText = 'The request was made but no response was received';
                logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - 500 - The request was made but no response was received`);
            } else {
                // Something happened in setting up the request and triggered an Error
                statusCode = 500;
                statusText = error.message;
                logger.error(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - 500 - ${error.message}`);
            }
        })
        .finally(function () {
            logger.info(`[ARTICLE] - [PICKCEL-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article api call retryCount: ${retryCounter} response delivered as: ${isDataSent}`);
            let lcdArticleLogList = [];
            for (let articleId of articleData) {
                lcdArticleLogList.push({
                    eventType: "ARTICLE",
                    eventData: articleUpdateBody,
                    inputBatchId: jobData.inputBatchId,
                    requestType: "ARTICLE",
                    requestMethod: "POST",
                    noticeType: noticeType,
                    articleId: articleId,
                    url: urlToHit,
                    statusCode: statusCode,
                    statusText: statusText
                });
            }
            let lcdOperationsControllerNoSQL = new (require('../../../controllers/v2/lcd-operations/lcdOperationsControllerNoSQL'))();
            lcdOperationsControllerNoSQL.insertLCDArticlesLog(jobData.customerCode, lcdArticleLogList);
            resolve(isDataSent);
        });
    });
}

global.sendLCDArticlesDicamoDataToLoadBalancer = function(articleData, jobData, noticeType) {
    return new Promise(async resolve => {
        let retryCounter = 0;
        let isRetryCompleted = false;
        let isDataDelivered = false;
        let maxRetriesCount = 1;        
        while (retryCounter <= maxRetriesCount) {
            try {
                logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter} - Started`);
                if (retryCounter == maxRetriesCount) {
                    isRetryCompleted = true;
                    logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter} - Completed`);
                }
                let apiResult = await callAPIandGetResultforLCDArticlesDicamo(articleData, jobData, retryCounter, noticeType);
                if (apiResult) {
                    isDataDelivered = true;
                    logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data delivered to customer: ${jobData.customerCode}, store: ${jobData.storeCode} for retry count: ${retryCounter}`);
                    logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data Retry Count: ${retryCounter} - Completed`);
                    break;
                } else {
                    logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data delivering to customer: ${jobData.customerCode}, store: ${jobData.storeCode} for retry count: ${retryCounter} failed, Retrying...`);
                }
                await waitForNextRetryForPickelDicamo(retryCounter, 'DICAMO');
                retryCounter++;
            } catch (error) {
                logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - Error in Retry Process while sending LCD Article data to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with retry count: ${retryCounter}`);
                logger.error(error);
                retryCounter++;
            }
        }
        if (isDataDelivered) {
            resolve(true);
            return;
        } else {
            resolve(false);
            return;
        }
    });
}

function callAPIandGetResultforLCDArticlesDicamo(articleUpdateBody, jobData, retryCounter, noticeType) {
    return new Promise(resolve => {
        let isDataSent = false;
        let urlToHit = `${process.env.LCD_BASE_URL}`;
        if (noticeType == 'UPDATE') {
            urlToHit = urlToHit + "/SolumA/Article/Update";
        }
        logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data posting URL: ${urlToHit}`);
        axios.put(urlToHit, articleUpdateBody, {
            timeout: 1000 * 3,
            headers: {
                Authorization: `solumdicamo`
            }
        }).then(function (response) {
            isDataSent = true;
            logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data successfully delivered to customer: ${jobData.customerCode}, store: ${jobData.storeCode} with for retry count: ${retryCounter}`);
        }).catch(function (error) {
            logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data sending to customer: ${jobData.customerCode}, store: ${jobData.storeCode} failed for retry count: ${retryCounter}`);
            if (error.response) {
                /*
                * The request was made and the server responded with a
                * status code that falls out of the range of 2xx, 404
                */
                logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                /*
                * The request was made but no response was received, `error.request`
                * is an instance of XMLHttpRequest in the browser and an instance
                * of http.ClientRequest in Node.js
                */
                logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - 500 - The request was made but no response was received`);
            } else {
                // Something happened in setting up the request and triggered an Error
                logger.error(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - 500 - ${error.message}`);
            }
        })
        .finally(function () {
            logger.info(`[ARTICLE] - [DICAMO-${noticeType}] - Transaction Sequence: ${jobData.txSequence} - LCD Article data api call retryCount: ${retryCounter} response delivered as: ${isDataSent}`);
            resolve(isDataSent);
        });
    });
}

module.exports = lcdOperationsController;