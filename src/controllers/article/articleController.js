const md5 = require('md5');
var fs = require('fs');
// var {
//     totalArticleUpdateReceivedWithLabel,
//     totalArticleUpdateProcessedWithLabel
// } = require('../../metrics/prometheusMetrics');

var dbHandler;
function articleController() {
    dbHandler = new(require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
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


var executeParallelforQueue = function () {
    // It's Promise
    return new Promise(function (resolved, rejected) {
        dbHandler.execParallel(function (result) {
            resolved(result);
        });
    });
};

articleController.prototype.getArticlesforQueue = function(articleData, customerCode, storeCode, customerId, storeId, txSequence){
    return new Promise(resolve => {
        logger.info(`Customer: [${customerCode}] - Transaction Sequence: ${txSequence} - Getting article details from database. Count: ${articleData.length}`);
        getArticlesforQueue_db(articleData, customerCode, storeCode, customerId, storeId, txSequence).then(function(){
            return executeParallelforQueue();
        }).then(function(result) {
            logger.info(`Customer: [${customerCode}] - Transaction Sequence: ${txSequence} - database result came for count: ${articleData.length}`);
            if (result.code == 1) {
                /* Need to do something */
                if(result.data.length > 0){
                    logger.info(`Customer: [${customerCode}] - Transaction Sequence: ${txSequence} - database result for count: ${articleData.length} - data array length: ${result.data.length}`);
                    if(result.data[0].length > 0){
                        logger.info(`Customer: [${customerCode}] - Transaction Sequence: ${txSequence} - database result for count: ${articleData.length} - data array inside length: ${result.data.length}`);
                        var articleDataArrayTotalBatch = result.data[0];
                        let articleDataArray = articleDataArrayTotalBatch;
                        result['storeId'] = articleDataArray[0].storeid;

                        /* Formatting Article Data */
                        for(var data = 0; data < articleDataArray.length; data++){
                            var articleDataInfo = articleDataArray[data];
                            var articleInfo = {};
                            if(articleDataInfo.data != null && articleDataInfo.data != ''){
                                articleInfo = articleDataInfo.data;
                            }else{
                                articleInfo = {
                                    id: articleDataArray[data].id ? articleDataArray[data].id : articleDataArray[data].articleId,
                                    name: articleDataArray[data].name ? articleDataArray[data].name : articleDataArray[data].articleName,
                                    nfc: articleDataArray[data].nfc_url,
                                    data: articleDataArray[data].data ? articleDataArray[data].data : ''
                                }
                            }
                            articleInfo['articleStoreCode'] = articleDataInfo.storecode;
                            result.data[0][data] = articleInfo;
                        }
                    }else{
                        result.code = -2;
                        result.msg = 'Articles ' + articleData.join() + ' not exists';
                    }
                }
            } else {
                logger.error(`Customer: [${customerCode}] - Transaction Sequence: ${txSequence} - Getting article details from database. Count: ${articleData.length} - Error`);
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    });
}

function getArticlesforQueue_db(articleData, customerCode, storeCode, customerId, storeId, txSequence){
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/article/getArticlesForQueue.sql`;
    return new Promise(function (resolved, reject) {
         var sqlQuery = fs.readFileSync(path, 'utf8');

        /* Replacing all commas with escapes */
        let escapedArticleIds = [];
        for(let item of articleData){
            try{
                let itemData = item.toString();
                itemData = itemData.replace(/,/g, '\\\,');
                escapedArticleIds.push(itemData);
            }catch(errConversion){
                escapedArticleIds.push(item);
                logger.error(`Error While converting & replacing article data`);
                logger.error(errConversion);
            }
        }

         let articlesToCheck = escapedArticleIds.length ? ( "'" + escapedArticleIds.join("', '") + "'" ) : '';
         let finalArticleIds = `{${articlesToCheck}}`;
         var parameters = {
            articleIds: finalArticleIds,
            customerId: customerId,
            storeId: storeId,
            storeCode: storeCode
         }
         dbHandler.executeCommandWithParams(sqlQuery, parameters, idx);
         idx++;
         resolved(true);
    });
 }


 articleController.prototype.postArticlePromisev2 = function(customerCode, storeCode, inputDataId, inputBatchId, articleData, customerId, storeId){
    return new Promise(resolve => {
        //  ***********Need to check later***************
        // if(process.env.METRICS_ENABLED == 'YES'){
        //     try{
        //         /* Metrics - Maintaing the article update count by customer (to be updated) */
        //         totalArticleUpdateReceivedWithLabel.labels(process.env.CODE_HOST_NAME, customerCode).inc(articleData.length);
        //     }catch(metricsError){
        //         logger.error(`Metrics Error - Maintaing the article update count by customer`);
        //         logger.error(metricsError);
        //     }
        // }

        logger.info(`[DB-INSERT] - [PROCESSING] - Customer: ${customerCode}, Store: ${storeCode}, inputBatchId: ${inputBatchId}, Article Insert Count: ${articleData.length}`);
        postArticlev2_db(customerCode, storeCode, inputDataId, articleData, inputBatchId, customerId, storeId).then(function(){
            return executeParallel();
        }).then(function(result) {
            logger.info(`[DB-INSERT] - [COMPLETED] - Customer: ${customerCode}, Store: ${storeCode}, inputBatchId: ${inputBatchId}, Article Insert Count: ${articleData.length}`);
            if (result.code == 1) {
                logger.info('Article Post Successful');

                //  ***********Need to check later***************
                // if(process.env.METRICS_ENABLED == 'YES'){                 
                //     try{
                //         /* Metrics - Maintaing the article update count by customer */
                //         totalArticleUpdateProcessedWithLabel.labels(process.env.CODE_HOST_NAME, customerCode).inc(articleData.length);
                //     }catch(metricsError){
                //         logger.error(`Metrics Error - Maintaing the article update count by customer`);
                //         logger.error(metricsError);
                //     }
                // }

                /* Saving Data into for History into Mongo DB */
                const articleControllerNoSQL = new(require('./articleControllerNoSQL'))();
                articleControllerNoSQL.insertArticleInfo(customerCode, storeCode, inputBatchId, articleData);

            } else {
                logger.error('Article Post Error');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    });
}

function postArticlev2_db(customerCode, storeCode, inputDataId, articleData, inputBatchId, customerId, storeId){
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/article/insertArticle.sql`;
    return new Promise(function (resolved, reject) {
        var sqlQuery = fs.readFileSync(path, 'utf8');
        let articleParameters = [];
        let articleFormat = null;
        articleData.forEach(function (article) {

            /* Getting distinct EANs */
            let articleEANs = null;
            if(Array.isArray(article.eans)){
                if(article.eans.length > 0){
                    articleEANs = [... new Set(article.eans)];
                }
            }
            
            let parameters = {
                customerId: customerId,
                storeId: storeId,
                id: article.articleId,
                name: article.articleName,
                nfc_url: article.nfcUrl ? article.nfcUrl : article.nfc,
                data: JSON.stringify(article),
                eans: articleEANs ? JSON.stringify(articleEANs): null,
                inputDataId: inputDataId,
                inputBatchId: inputBatchId
            }

            if(articleFormat){
                let md5HashRawData = {
                    ...article.data
                }
                delete md5HashRawData[articleFormat.mappingInfo.store];
                parameters['md5Hash'] = md5(JSON.stringify(md5HashRawData));
            }else{
                parameters['md5Hash'] = "";
            }

            articleParameters.push(parameters);
        });
        dbHandler.executeCommandWithParams_MultipleArray(sqlQuery, articleParameters, idx);
        idx++;
        resolved(true);
    });
}

module.exports = articleController;