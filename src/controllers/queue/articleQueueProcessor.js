var {
    INPUT_DATA_STATUS_TYPE_FAILED,
} = require('../../utilities/constants');
require('moment-duration-format');
const deepmerge = require('deepmerge');
function articleQueueProcessor(){
    dbHandler = new(require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
    return this;
}

function getMergedData(dbObject, newObject){
    return deepmerge(dbObject, newObject)
}

articleQueueProcessor.prototype.processQueue = function(job){
    return new Promise(resolve => {
        (async () => {            
            let jobFullData = job.data;
            let queueName = jobFullData.queueName;
            try{
                logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Started Processing`, {customer: jobFullData.customerCode});

                /* Getting SoluM Formatted Article */
                let jobData = JSON.parse(jobFullData.data);
                let solumArticlesList = jobData;

                /* input data detail insertion */
                // if(jobFullData.hasOwnProperty('inputDataDetailInsertion') == true){
                //     let inputDataControllerNoSQL = new(require('../../controllers/input/inputDataControllerNoSQL'))();
                //     inputDataControllerNoSQL.insertDetailArticleInfo(jobFullData.customerCode, 'FILE', jobFullData);
                // }

                /* Divide articles Into Batches and Process */
                let commonController = new(require('../common/commonController.js'))();
                let batches = await commonController.divideArrayIntoEqualBatches(solumArticlesList.dataList, parseInt(process.env.BATCH_PROCESS_SIZE));
                logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - No.of Batches to Process: ${batches.length}`, {customer: jobFullData.customerCode});

                if(jobFullData.requestType == 'PUT'){
                    /* If request type is PUT, then we need to merge with the existing article information. */
                    /* batch by batch we need to get the article information from database and merge and then proceed for saving */
                    /* article merge with old data - Start */
                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Started merging with existing data`, {customer: jobFullData.customerCode});
                    // for(const articles of batches) {
                    for (const [batchIndex, articles] of batches.entries()) {
                        /* getting unique Article ids for batch */
                        let updateArticleIds = [];
                        articles.map((obj) => {
                            if (!updateArticleIds.find(updateId => updateId == obj.articleId)){
                                updateArticleIds.push(obj.articleId);
                            }
                        });
                        /* getting existing article data for merging with new data */
                        if(updateArticleIds.length > 0){
                            let articleController = new(require('../article/articleController'))();
                            // let dbArticleDataResult = await articleController.checkArticleById_Array_ForEvents(updateArticleIds, jobFullData.customerCode, jobFullData.storeCode);
                            let dbArticleDataResult = await articleController.getArticlesforQueue(updateArticleIds, jobFullData.customerCode, jobFullData.storeCode, jobFullData.customerId, jobFullData.storeId, jobFullData.txSequence);
                            if(dbArticleDataResult.code == 1){
                                if(dbArticleDataResult.data.length > 0){
                                    if(dbArticleDataResult.data[0].length > 0){
                                        let dbArticleData = dbArticleDataResult.data[0];
                                        /* merging old data with new data */
                                        let articlesArrayAfterMergingwithOldData = [];
                                        for(const currentObj of articles){
                                            let existingObj = dbArticleData.find(item => item.articleId == currentObj.articleId);
                                            if(existingObj){
                                                let finalArticleAfterMerge = getMergedData(existingObj, currentObj);
                                                articlesArrayAfterMergingwithOldData.push(finalArticleAfterMerge);
                                                logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - After merging the article data: ${JSON.stringify(finalArticleAfterMerge)}`, {customer: jobFullData.customerCode});
                                            }else{
                                                articlesArrayAfterMergingwithOldData.push(currentObj);
                                                logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Article Id: ${currentObj.articleId} - not existing in database. So inserting as is`, {customer: jobFullData.customerCode});
                                            }
                                        }
                                        batches[batchIndex] = articlesArrayAfterMergingwithOldData;
                                    }else{
                                        logger.info(`${queueName} -  [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Articles not found for update: ${JSON.stringify(updateArticleIds)}`, {customer: jobFullData.customerCode});
                                    }
                                }else{
                                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Articles not found for update: ${JSON.stringify(updateArticleIds)}`, {customer: jobFullData.customerCode});
                                }
                            }else if(dbArticleDataResult.code == -2){
                                logger.info(`${queueName} - [ARTICLE] - PUT Request - Customer: ${jobFullData.customerCode} - Transaction Sequence: ${jobFullData.txSequence} - Getting PUT (Existing) Data for article Ids: ${JSON.stringify(updateArticleIds)} completed.`, {customer: jobFullData.customerCode});
                                logger.info(`${queueName} - [ARTICLE] - PUT Request - Customer: ${jobFullData.customerCode} - Transaction Sequence: ${jobFullData.txSequence} - Info: ${JSON.stringify(dbArticleDataResult)}`, {customer: jobFullData.customerCode});
                            }else{
                                logger.error(`${queueName} - [ARTICLE] - PUT Request - Customer: ${jobFullData.customerCode} - Transaction Sequence: ${jobFullData.txSequence} - Getting PUT (Existing) Data for article Ids: ${JSON.stringify(updateArticleIds)} failed.`, {customer: jobFullData.customerCode});
                                logger.error(`${queueName} - [ARTICLE] - PUT Request - Customer: ${jobFullData.customerCode} - Transaction Sequence: ${jobFullData.txSequence} - Error: ${JSON.stringify(dbArticleDataResult)}`, {customer: jobFullData.customerCode});
                            }
                        }
                    }
                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Completed merging with existing data`, {customer: jobFullData.customerCode});
                    /* article merge with old data - End */
                }

                /* Checking whether LCD is enabled for customer */
                let packageInfo = '';
                let lcdPackageStatus = getLcdPackageStatus(jobFullData.customerCode);
                if (lcdPackageStatus.code == -1) {
                    logger.error(`${queueName} - [ARTICLE] - [LCD] Transaction Sequence: ${jobFullData.txSequence} - Customer: ${jobFullData.customerCode} - Error while fetching lcd package information`, {customer: jobFullData.customerCode});
                    logger.error(`${queueName} - [ARTICLE] - [LCD] Transaction Sequence: ${jobFullData.txSequence} - Customer: ${jobFullData.customerCode} - Error: ${JSON.stringify(lcdPackageStatus)}`, {customer: jobFullData.customerCode});
                } else if (lcdPackageStatus.code == -2) {
                    logger.info(`${queueName} - [ARTICLE] - [LCD] Transaction Sequence: ${jobFullData.txSequence} - Customer: ${jobFullData.customerCode} - Failed LCD package reason: ${lcdPackageStatus.msg}`, {customer: jobFullData.customerCode});
                } else {
                    packageInfo = lcdPackageStatus.data;
                    logger.info(`${queueName} - [ARTICLE] - [LCD] Transaction Sequence: ${jobFullData.txSequence} - Customer: ${jobFullData.customerCode} - ${lcdPackageStatus.msg}`, {customer: jobFullData.customerCode});
                }

                /* Saving Article Info into Database */
                let batchNumber = 0;
                let failedCount = 0;
                let successCount = 0;
                for(const batch of batches) {
                    batchNumber++;
                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Batch of ${batchNumber} / ${batches.length} - Started Processing`, {customer: jobFullData.customerCode});
                    let articleController = new(require('../article/articleController'))();
                    let batchSaveResult = await articleController.postArticlePromisev2(jobFullData.customerCode, jobFullData.storeCode, jobFullData.inputId, jobFullData.inputBatchId, batch, jobFullData.customerId, jobFullData.storeId);
                    if(batchSaveResult.code == 1){
                        logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Batch of ${batchNumber} / ${batches.length} - Database Update Successful`, {customer: jobFullData.customerCode});
                        successCount++;

                    }else{
                        logger.error(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Batch of ${batchNumber} / ${batches.length} - Database Update Failed`, {customer: jobFullData.customerCode});
                        logger.error(JSON.stringify(batchSaveResult));
                        failedCount++;
                    }
                    

                    /* LCD Related Process */
                    if(packageInfo && packageInfo.status == true){
                        await processLCDArticleUpdate(batch, batchNumber, batches.length, jobFullData, queueName, packageInfo);
                    } 
                    
                }
               resolve(true);
                return;
            }catch(err){
                logger.info(`Customer: ${jobFullData.customerCode}, Store: ${jobFullData.storeCode}, Transaction Sequence: ${jobFullData.txSequence}, JobId: ${job.id} - Error while Processing`);
                
                logger.error(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - Error While Processing`, {customer: jobFullData.customerCode});
                logger.error(err);
                /* Update Finished Status in database */
                let finishedStatusUpdate = {
                    txSequence: jobFullData.txSequence,
                    type: jobFullData.type,
                    status: INPUT_DATA_STATUS_TYPE_FAILED
                }

                let finishedInputDataController = new(require('../input/inputDataController'))();
                let finalUpdResult = await finishedInputDataController.updateInputData(finishedStatusUpdate);
                if(finalUpdResult.code == 1){
                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - ${INPUT_DATA_STATUS_TYPE_FAILED} Status Updated`, {customer: jobFullData.customerCode});
                    resolve(true);
                }else{
                    logger.info(`${queueName} - [ARTICLE] Transaction Sequence: ${jobFullData.txSequence} - ${INPUT_DATA_STATUS_TYPE_FAILED} Status Update Failed`, {customer: jobFullData.customerCode});
                    resolve(false);
                }
            }
        })();
    });
}

function getLcdPackageStatus(customerCode){
    let result = {
        code: 1,
        msg: '',
        data: ''
    };
    try {
        if (process.env.LCD_ENABLED == 'YES') {
            /** Get Customer Info for customer in JobFullData */
            let customerInfo = global.customers.find(item => item.code == customerCode);
            if (!customerInfo) {
                result.code = -2;
                result.msg = 'CUSTOMER_NOT_FOUND';
                return result;
            }
            /** LCD Type Validation */
            let pkgInfo = {
                status: false,
                type: ''
            };
            if (customerInfo.packages) {
                if (Array.isArray(customerInfo.packages)) {
                    if (customerInfo.packages.length > 0) {
                        for (let pkg of customerInfo.packages) {
                            if (pkg.package == 'LCD') {
                                pkgInfo.status = pkg.status;
                                break;
                            }
                        }
                        if(pkgInfo.status){
                            pkgInfo = {
                                type: 'DICAMO',
                                status: true
                            };
                            for (let pkg of customerInfo.packages) {
                                if (pkg.type == 'PICKCEL' && pkg.package == 'LCDTYPE') {
                                    pkgInfo = {
                                        type: 'PICKCEL',
                                        status: true
                                    };
                                    break;
                                }
                            }
                        }
                    }
                }
            }
           
            /* Making final object to return */
            if (pkgInfo.status == false) {
                result.code = -2;
                result.msg = `LCD_NOT_ENABLED`;
                return result;
            } else {
                result.code = 1;
                result.msg = `LCD_${pkgInfo.type}_ENABLED`;
                result.data = JSON.parse(JSON.stringify(pkgInfo));
                return result;
            } 
            
        } else {
            result.code = -2;
            result.msg = 'LCD_SERVER_NOT_ENABLED';
            return result;
        }
    } catch (error) {
        result.code = -1;
        result.msg = error;
        return result;
    }
}

async function processLCDArticleUpdate(articles, batchNumber, totalBatchCount, jobFullData, queueName, packageInfo) {
    try {
        /** Articles Validation */
        if (!Array.isArray(articles) || articles.length == 0) {
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - No articles passed in this batch, so not proceeding further`);
            return false;
        }

        /** Get LCD articles from the articles */
        let articlesList = [];
        for (let articleInfo of articles) {
            articlesList.push(articleInfo.articleId);
        }
        logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - LCD enabled for: ${packageInfo.type} and articles passed are: ${JSON.stringify(articlesList)} and articles count: ${articlesList.length}, proceeding to get LCD articles from these articles passed`);

        let lcdOperationsController = new(require('../v2/lcd-operations/lcdOperationsController'))();
        let articlesFoundResult = await lcdOperationsController.getLcdArticlesByArticleIds(articlesList, jobFullData.customerId, jobFullData.storeId);
        if (articlesFoundResult.code != 1) {
            logger.error(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Error while getting LCD articles from the articles passed, so not proceeding this batch further`);
            return false;
        }
        let isArticleExists = false;
        if (articlesFoundResult.data.length > 0) {
            if (articlesFoundResult.data[0].length > 0) {
                isArticleExists = true;
            }
        }
        if (!isArticleExists) {
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - No LCD articles found from the articles passed, so not proceeding this batch further`);
            return false;
        }

        let foundLCDArticles = [];
        for (let article of articlesFoundResult.data[0]) {
            foundLCDArticles.push(article.articleids);
        }

        logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - LCD articles found from the articles passed [${foundLCDArticles.length}/${articlesList.length}], proceeding to update the LCD articles: ${JSON.stringify(foundLCDArticles)}`);
        
        /** Update LCD articles */
        lcdOperationsController = new(require('../v2/lcd-operations/lcdOperationsController'))();
        let aritcleUpdateResult = await lcdOperationsController.updateLcdArticlePickcelResult_Array(foundLCDArticles, jobFullData.storeId, jobFullData.customerId);
        if (aritcleUpdateResult.code != 1) {
            logger.error(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Error while updating the LCD articles: ${JSON.stringify(aritcleUpdateResult)}, so not proceeding this batch further`);
            return false;
        }
        logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Successfully updated the LCD articles, so proceeding this batch further`);

        /** On package type redirect the webhook API */
        if (packageInfo.type == "PICKCEL") {
            if (process.env.PICKCEL_SERVICE_ENABLED != 'YES') {
                logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - PICKCEL_SERVICE_DISABLED, so not proceeding this batch further`);
                return false;
            }
            let commonController = new(require('../common/commonController.js'))();
            let pickcelBatches = await commonController.divideArrayIntoEqualBatches(foundLCDArticles, parseInt(process.env.PICKCEL_SERVICE_EVENT_UPDATE_BATCH_SIZE));
            let pickcelTotalBatchCount = pickcelBatches.length;
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - [TOTAL_PICKCEL_BATCHES: ${pickcelTotalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Proceeding to send article data to call webhook API batchwise to notify articles are updated`);
            
            let pickcelBatchNumber = 0;

            /** Articles split batchwise and process */
            for (let pickcelBatch of pickcelBatches) {
                pickcelBatchNumber++;                
                logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - [PICKCEL_BATCH: ${pickcelBatchNumber}/${pickcelTotalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Started calling the webhook API to notify articles are updated and the articles in this batch are: ${JSON.stringify(pickcelBatch)} and articles count: ${pickcelBatch.length}`);
                
                /** Send updated articles to webhook to notify that articles been updated */
                global.sendLCDArticlesPickcelDataToLoadBalancer(pickcelBatch, jobFullData, 'UPDATE');
                
                logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - [PICKCEL_BATCH: ${pickcelBatchNumber}/${pickcelTotalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Completed the webhook API call to notify articles are updated`);
            }
            return true;
        } else {
            /** Get updated articles info from db */
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Started getting the updated LCD articles`);
            let articleController = new(require('../../controllers/article/articleController'))();
            // let articlesResult = await articleController.checkArticleById_Array_ForEvents(foundLCDArticles, jobFullData.customerCode, jobFullData.storeCode);
            let articlesResult = await articleController.getArticlesforQueue(foundLCDArticles, jobFullData.customerCode, jobFullData.storeCode, jobFullData.customerId, jobFullData.storeId, jobFullData.txSequence);
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Completed getting the updated LCD articles`);

            if (articlesResult.code != 1) {
                logger.error(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Error while getting the updated LCD articles, so not proceeding this batch further`);
                logger.error(JSON.stringify(articlesResult));
                return false;
            }

            let isUpdatedArticlesFound = false;
            if (articlesResult.data.length > 0) {
                if (articlesResult.data[0].length > 0) {
                    isUpdatedArticlesFound = true;
                }
            }

            if (!isUpdatedArticlesFound) {
                logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - No updated LCD articles found, so not proceeding this batch further`);
                return false;
            }

            let updatedArticlesList = [];
            let updatedEventData = [];
            for (let articleInfo of articlesResult.data[0]) {
                let newArticleInfo = {};
                if (articleInfo.hasOwnProperty('store')) { 
                    newArticleInfo.store = articleInfo.store;
                } else {
                    newArticleInfo.store = jobFullData.storeCode;
                }
                if (articleInfo.hasOwnProperty('articleId')) {
                    updatedArticlesList.push(articleInfo.articleId);
                    newArticleInfo.articleId = articleInfo.articleId;
                } else if (articleInfo.hasOwnProperty('id')) {
                    updatedArticlesList.push(articleInfo.id);
                    newArticleInfo.articleId = articleInfo.id;
                } else {
                    newArticleInfo.articleId = null;
                }
                if (articleInfo.hasOwnProperty('articleName')) {
                    newArticleInfo.articleName = articleInfo.articleName;
                } else if (articleInfo.hasOwnProperty('name')) {
                    newArticleInfo.articleName = articleInfo.name;
                } else {
                    newArticleInfo.articleName = null;
                }
                if (articleInfo.hasOwnProperty('nfcUrl')) {
                    newArticleInfo.nfcUrl = articleInfo.nfcUrl;
                } else if (articleInfo.hasOwnProperty('nfc')) {
                    newArticleInfo.nfcUrl = articleInfo.nfc;
                } else {
                    newArticleInfo.nfcUrl = null;
                }
                if (articleInfo.hasOwnProperty('data')) {
                    newArticleInfo.data = articleInfo.data;
                } else {
                    newArticleInfo.data = {};
                }
                updatedEventData.push(newArticleInfo);
            }

            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Found updated LCD articles [${updatedArticlesList.length}/${foundLCDArticles.length}] and the found articles are: ${JSON.stringify(updatedArticlesList)}`);

            let articleUpdateBody = {
                company: jobFullData.customerCode,
                store: jobFullData.storeCode,
                data: updatedEventData
            };

            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Started calling the webhook API to notify articles are updated`);
                
            /** Send updated articles to webhook to notify that articles been updated */
            global.sendLCDArticlesDicamoDataToLoadBalancer(articleUpdateBody, jobFullData, 'UPDATE');
                
            logger.info(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Customer: ${jobFullData.customerCode} - [PACKAGE: ${packageInfo.type}] - Completed the webhook API call to notify articles are updated`);
            return true;
        }
    } catch (error) {
        logger.error(`${queueName} - [ARTICLE_QUEUE] - [LCD_UPDATE] - Transaction Sequence: ${jobFullData.txSequence} - [BATCH: ${batchNumber}/${totalBatchCount}] - Error while processing LCD Article update`);
        logger.error(error);
        return false;
    }
}

module.exports = articleQueueProcessor;