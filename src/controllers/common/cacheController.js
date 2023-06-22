let redisHandler;
function cacheController(){
    redisHandler = new(require('../../repository/redis/handlers/redisHandler'))();
    return this;
}

cacheController.prototype.setCachePromise = function(key, value){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValue(key, value);
                if(process.env.DETAILED_LOGS == 'YES'){
                    logger.info(`[REDIS] - New Key: ${key} Added to Redis Cache with Value: ${value}`);
                }
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.setCacheWithExpiryPromise = function(key, value){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValueWithExpiry(key, value);
                if(process.env.DETAILED_LOGS == 'YES'){
                    logger.info(`[REDIS] - New Key: ${key} Added to Redis Cache with Value: ${value}`);
                }
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}


cacheController.prototype.setCacheWithExpiryPromisev2 = function(key, value, expiryInSeconds){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValueWithExpiryv2(key, value, expiryInSeconds);
                if(process.env.DETAILED_LOGS == 'YES'){
                    logger.info(`[REDIS] - New Key: ${key} Added to Redis Cache with Value: ${value}`);
                }
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.setCache = function(key, value){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValue(key, value);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.setCache = function(key, value, callback){
    if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
        (async () => {
            let redisCacheResult = await redisHandler.setValue(key, value);
            callback(redisCacheResult);
        })();
    }else{
        if(process.env.DETAILED_LOGS == 'YES'){
            logger.info('Redis Set Cache Disabled');
        }
        callback(null);
    }
}

cacheController.prototype.getCachePromise = function(key){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.getValue(key);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.deleteCacheStoreKey = function(key){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.deleteKey(key);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.getCache = function(key){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.getValue(key);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.getCache = function(key, callback){
    if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
        redisHandler.getValue(key).then((resullt) => {
            callback(resullt)
        });
    }else{
        if(process.env.DETAILED_LOGS == 'YES'){
            logger.info('Redis Get Cache Disabled');
        }
        callback(null);
    }
}

cacheController.prototype.getLedConfigCache = function(key){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.getValue(key);
                if(process.env.DETAILED_LOGS == 'YES'){
                    logger.info(`LED Pattern Cache Updated: ${redisCacheResult}`);
                }
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.setLedConfigCache = function(key, value){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValue(key, value);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}
cacheController.prototype.getCommonCache = function(key){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.getValue(key);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.setCommonCache = function(key, value){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.setValue(key, value);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('Redis Set Cache Disabled');
            }
            resolve(null);
        }
    });
}

cacheController.prototype.getRedisKeysList = function(){
    return new Promise(async (resolve, reject) => {
            let redisCacheKeysResult = await redisHandler.getAllRedisKeys();
            resolve(redisCacheKeysResult);
    });
}

cacheController.prototype.getRedisKeysListStartsWith = function(startsWith){
    return new Promise(async (resolve, reject) => {
            let redisCacheKeysResult = await redisHandler.getAllRedisKeysStartsWith(startsWith);
            resolve(redisCacheKeysResult);
    });
}

cacheController.prototype.getRedisServerVersion = function(){
    return new Promise(async (resolve) => {
        let serverVer = await redisHandler.getServerVersion();
        resolve(serverVer);
    });
}

cacheController.prototype.deleteCacheStoreKeyStartsWith = function(startsWith){
    return new Promise(async (resolve, reject) => {
        if(process.env.REDIS_CACHE_ENABLED.toUpperCase() == 'YES'){
                let redisCacheResult = await redisHandler.deleteKeysStartsWith(startsWith);
                resolve(redisCacheResult);
        }else{
            if(process.env.DETAILED_LOGS == 'YES'){
                logger.info('[REDIS] - Redis Get Cache Disabled');
            }
            resolve(null);
        }
    });
}
module.exports = cacheController;