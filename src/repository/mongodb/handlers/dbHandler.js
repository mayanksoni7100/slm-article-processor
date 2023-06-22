function mongodbHandler() {
    return this;
}

mongodbHandler.prototype.getServerStatus = function(){
    return new Promise(async resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []};
        try{
            Promise.race([new Promise(resolve=>{
                setTimeout(resolve,30000,false);
            }),global.nosql_info.admin.serverStatus()]).then(result=>{
                if(result){
                    resultToReturn.data.push(result);
                    resolve(resultToReturn);
                }else{
                    resolve(false);
                }
            }).catch(err=>{
                resultToReturn.code = -1;
                resultToReturn.msg = err;
                resultToReturn.data.push(err);
                logger.error('[MONGO_DB_HANDLER] : [GET_SERVER_STATUS] - Error while getting the mongo server status');
                logger.error(err);
                resolve(resultToReturn);
            })
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error('[MONGO_DB_HANDLER] : [GET_SERVER_STATUS] - Error while getting the mongo server status');
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getListOfAllDatabases = function(){
    return new Promise(async resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []};
        try{
            Promise.race([new Promise(resolve=>{
                setTimeout(resolve,30000,false);
            }),global.nosql_info.executeDbAdminCommand({"listDatabases":1})]).then(result=>{
                if(result){
                    resultToReturn.data.push(result);
                    resolve(resultToReturn);
                }else{
                    resolve(false);
                }
            }).catch(err=>{
                resultToReturn.code = -1;
                resultToReturn.msg = err;
                resultToReturn.data.push(err);
                logger.error('[MONGO_DB_HANDLER] : [GET_LIST_OF_ALL_DATABASES] - Error while getting list of all databases in mongo');
                logger.error(err);
                resolve(resultToReturn);
            })
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error('[MONGO_DB_HANDLER] : [GET_LIST_OF_ALL_DATABASES] - Error while getting list of all databases in mongo');
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getConnectionStatus = function(){
    return new Promise(async resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []};
        try{
            Promise.race([new Promise(resolve=>{
                setTimeout(resolve,30000,false);
            }),global.nosql_info.executeDbAdminCommand({"connectionStatus":1})]).then(result=>{
                if(result){
                    resultToReturn.data.push(result);
                    resolve(resultToReturn);
                }else{
                    resolve(false);
                }
            }).catch(err=>{
                resultToReturn.code = -1;
                resultToReturn.msg = err;
                resultToReturn.data.push(err);
                logger.error('[MONGO_DB_HANDLER] : [GET_CONNECTION_STATUS] - Error while getting mongo connection status');
                logger.error(err);
                resolve(resultToReturn);
            })
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error('[MONGO_DB_HANDLER] : [GET_CONNECTION_STATUS] - Error while getting mongo connection status');
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.createCollection = function(collectionName){
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

mongodbHandler.prototype.dropCollection = function(collectionName){
    return new Promise(resolve => {
        try{
            global.nosql_info.dropCollection(collectionName, function(err, result) {
                if (err) {
                    logger.error(`Mongo DB Collection ${collectionName} drop failed`);
                    logger.error(err);
                    resolve(false);
                } else {
                    logger.info(`Mongo DB Collection ${collectionName} dropped successfully`);
                    resolve(true);
                }
            });
        }catch(err){
            logger.error('While dropping the collections');
            logger.error(err);
            resolve(false);
        }
    });
}

mongodbHandler.prototype.createIndexWithAdditionalOptions = function(collectionName, index, options){
    return new Promise(resolve => {
        try{
            global.nosql_info.collection(collectionName).createIndex(index, options, function(err, results) {
                if (err) {
                    logger.error(`Mongo DB Collection ${collectionName}, Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)} - creation failed`);
                    logger.error(err);
                    resolve(false);
                } else {
                    logger.info(`Mongo DB Collection ${collectionName}, Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)} - creation successful with result: ${JSON.stringify(results)}`);
                    resolve(true);
                }
            });
        }catch(err){
            logger.error(`While creating the index on collection: ${collectionName} - Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)}`);
            logger.error(err);
            resolve(false);
        }
    });
}


mongodbHandler.prototype.dropIndexWithAdditionalOptions = function(collectionName, index, options){
    return new Promise(resolve => {
        try{
            global.nosql_info.collection(collectionName).dropIndex(index, options, function(err, results) {
                if (err) {
                    logger.info(`Mongo DB Collection ${collectionName}, Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)} - drop failed`);
                    logger.info(err);
                    resolve(false);
                } else {
                    logger.info(`Mongo DB Collection ${collectionName}, Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)} - drop successful with result: ${JSON.stringify(results)}`);
                    resolve(true);
                }
            });
        }catch(err){
            logger.error(`While dropping the index on collection: ${collectionName} - Index: ${JSON.stringify(index)}, Options: ${JSON.stringify(options)}`);
            logger.error(err);
            resolve(false);
        }
    });
}

mongodbHandler.prototype.insertDocument = function(collectionName, doc) {
    return new Promise(resolve => {
        let resultToReturn = {code: -1, msg: '', data: []}
        try{
            logger.info(`Mongo DB - Insert Documents - Collection Name: ${collectionName}, Data: ${JSON.stringify(doc)}`);
            global.nosql_info
                .collection(collectionName)
                .insertOne(doc, function(err, result) {
                    if (err) {
                        logger.error(`Mongo Database Error - Insert Document Error: ${JSON.stringify(doc)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    } else {

                        logger.info(`Mongo DB - Insert Document Result - ${JSON.stringify(result)}`);
                        

                        resultToReturn.code = 1;
                        resultToReturn.msg = 'success';
                        resultToReturn.data.push(result);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo Database Error - Insert Document Error: Doc - ${JSON.stringify(doc)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.insertManyDocuments = function(collectionName, docs) {
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            //logger.info(`Mongo DB - Insert Documents - Collection Name: ${collectionName}, Data: ${JSON.stringify(docs)}`);
            global.nosql_info
                .collection(collectionName)
                .insertMany(docs, function(err, result) {
                    if (err) {
                        // logger.error(`Mongo Database Error - Insert Many Documents Error: ${JSON.stringify(docs)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    } else {

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - Insert Many Documents Result - ${JSON.stringify(result)}`);
                        // }

                        resultToReturn.data.push(result);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            // logger.error(`Mongo Database Error - Insert Many Documents Error: Docs - ${JSON.stringify(docs)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.updateDocument = function(collectionName, query, updateDocs) {
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            // logger.info(`Mongo DB - Update Documents - Collection Name: ${collectionName}, Query: ${JSON.stringify(query)}, To Be Updated Doc: ${JSON.stringify(updateDocs)}`);
            global.nosql_info
                .collection(collectionName)
                .updateOne(query, { $set: updateDocs} , { "upsert": false }, function(err, result) {
                    if (err) {
                        logger.error(`Mongo Database Error - Update Document Error: ${JSON.stringify(query)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    } else {

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - Update Document Result - ${JSON.stringify(result)}`);
                        // }

                        resultToReturn.data.push(result);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            // logger.error(`Mongo Database Error - Update Documents - Collection Name: ${collectionName}, Query: ${JSON.stringify(query)}, To Be Updated Doc: ${updateDocs}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.deleteDocument = function(collectionName, doc) {
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - Delete Documents - Collection Name: ${collectionName}, Data: ${JSON.stringify(doc)}`);
            global.nosql_info
                .collection(collectionName)
                .deleteMany(doc, function(err, result) {
                    if (err) {
                        // logger.error(`Mongo Database Error - Delete Documents Error: ${JSON.stringify(doc)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    } else {
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - Delete Documents Result - ${JSON.stringify(result)}`);
                        // }

                        resultToReturn.data.push(result);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            // logger.error(`Mongo Database Error - Delete Documents Error: Doc - ${JSON.stringify(doc)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getDocumentsWithFilters = function(collectionName, query, sortQuery, skip, limit){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}, Skip: ${skip}, Limit: ${limit}`);
            global.nosql_info
                .collection(collectionName)
                .find(query, { allowDiskUse: true })
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }

                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getDocumentsWithFilters_secondary = function(collectionName, query, sortQuery, skip, limit){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}, Skip: ${skip}, Limit: ${limit}`);
            global.nosql_info_secondary
                .collection(collectionName)
                .find(query, { allowDiskUse: true })
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }

                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getDocumentsWithFiltersV2 = function(collectionName, query, projection, sortQuery, skip, limit){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}, Skip: ${skip}, Limit: ${limit}`);
            global.nosql_info
                .collection(collectionName)
                .find(query, {
                    allowDiskUse: true,
                    projection : projection
                 })
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }
                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)} - Sort By: ${JSON.stringify(sortQuery)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getDocumentsCount = function(collectionName, query){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocumentsCount: Query - ${JSON.stringify(query)}`);
            global.nosql_info
                .collection(collectionName)
                .find(query, { allowDiskUse: true })
                .count({}, function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocumentsCount: Query - ${JSON.stringify(query)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo DB - getDocumentsCount Result - ${JSON.stringify(documents)}`);
                        // }

                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo Database Error - getDocumentsCount: Query - ${JSON.stringify(query)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getDocuments = function(collectionName, query, fields){
    logger.info('db handleers',collectionName,query,fields)
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            global.nosql_info
                .collection(collectionName)
                .find(query, { allowDiskUse: true })
                .project(fields)
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo Database - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }
                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getAggregationDocuments = function(collectionName, query){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            global.nosql_info
                .collection(collectionName)
                .aggregate(query, { allowDiskUse: true })
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo Database - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }
                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

mongodbHandler.prototype.getAggregationDocuments_secondary = function(collectionName, query){
    return new Promise(resolve => {
        let resultToReturn = {code: 1, msg: 'success', data: []}
        try{
            logger.info(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            global.nosql_info_secondary
                .collection(collectionName)
                .aggregate(query, { allowDiskUse: true })
                .toArray(function(err, documents) {
                    if(err){
                        logger.error(`Mongo Database Error - getDocuments: Query - ${JSON.stringify(query)}`);
                        logger.error(`${err.message} - ${err}`);
                        resultToReturn.code = -1;
                        resultToReturn.msg = err;
                        resultToReturn.data.push(err);
                    }else{
                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info(`Mongo Database - getDocuments Result - ${JSON.stringify(documents)}`);
                        // }
                        resultToReturn.data.push(documents);
                    }
                    resolve(resultToReturn);
                });
        }catch(err){
            resultToReturn.code = -1;
            resultToReturn.msg = err;
            resultToReturn.data.push(err);
            logger.error(`Mongo DB - getDocuments: Query - ${JSON.stringify(query)}`);
            logger.error(err);
            resolve(resultToReturn);
        }
    });
}

module.exports = mongodbHandler;
