let mongodbHandler;
var {
    NOSQL_CLCTN_L_ARTICLE,
} = require('../../utilities/constants');

function articleControllerNoSQL(){
    mongodbHandler = new(require(`../../repository/${process.env.NOSQL_TYPE}/handlers/dbHandler`))();
}

articleControllerNoSQL.prototype.insertArticleInfo = function(customerCode, storeCode, inputBatchId, documents){
    return new Promise(async resolve => {
        try{
            logger.info(`Saving Article Info in Mongo DB`);
            let finalDocuments = [];
            documents.forEach(article => {
                let document = {
                    store: storeCode,
                    inputBatchId: inputBatchId,
                    articleData: article,
                    insertTime: new Date()
                }
                finalDocuments.push(document);
            });
            logger.info(`Articles to insert in mongo db: ${finalDocuments.length}`);
            let result = await mongodbHandler.insertManyDocuments(`${customerCode}.${NOSQL_CLCTN_L_ARTICLE}`, finalDocuments);
            if(result.code == 1){
                resolve(true);
            }else{
                resolve(false);
            }
        }catch(err){
            logger.error('Error while inserting article data to mongo db');
            logger.error(err);
            resolve(false);
        }
    });
}

module.exports = articleControllerNoSQL;