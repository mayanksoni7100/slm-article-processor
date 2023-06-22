const redis = require("redis");

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    reconnectStrategy: function (attempts) {
      if (attempts > 10) {
        // End reconnecting with built in error
        return new Error("Too many attempts to redis connection failed");
      }
      return Math.min(attempts * 100, 3000);
    },
    connectTimeout: 1000*60,  //60 seconds
  },
});

(async () => {
  try {
    await client.connect();
    try {
      let succeeded = await client.flushDb();
      logger.info("Redis Cache Flushed");
      logger.info(succeeded);
      global.redisClient = client;
    } catch (err) {
      logger.error("While Flushing Redis Cache");
      logger.error(err);
    }
  } catch (err) {
    logger.error("Redis Server Connection Error");
    logger.error(error);
  } 
})();



client.on("error", function (error) {
  logger.error("Redis Server Connectin Error");
  logger.error(error);
});

let redisCacheExpiry =
  parseInt(process.env.REDIS_CACHE_REFRESH_EVERY_IN_MIN) * 60;

function redisHandler() {
  /* nothing to do */
}

redisHandler.prototype.setValue = function (key, value) {
  return new Promise(async (resolve) => {
    try {
      await client.set(key, value);
      logger.info(`Redis Cache Set Success - Key: ${key}`);
      resolve(true);
    } catch (err) {
      logger.error(`Redis Cache Set Error - Key ${key}`);
      logger.error(err);
      resolve(false);
    }
  });
};

redisHandler.prototype.setValueWithExpiry = function (key, value) {
  return new Promise(async (resolve) => {
    try {
      await client.set(key, value);
      await client.expire(key, redisCacheExpiry);
      logger.info(`Redis Cache Set Success - Key: ${key}`);
      resolve(true);
    } catch (err) {
      logger.error(`Redis Cache Set Error - Key ${key}`);
      logger.error(err);
      resolve(false);
    }
  });
};

redisHandler.prototype.setValueWithExpiryv2 = function (
  key,
  value,
  expiryInSeconds
) {
  return new Promise(async (resolve) => {
    try {
      await client.set(key, value);
      await client.expire(key, expiryInSeconds);
      logger.info(`Redis Cache Set Success - Key: ${key}`);
      resolve(true);
    } catch (err) {
      logger.error(`Redis Cache Set Error - Key ${key}`);
      logger.error(err);
      resolve(false);
    }
  });
};

redisHandler.prototype.deleteKey = function (key) {
  return new Promise(async (resolve) => {
    try {
      await client.del(key);
      logger.info(`Redis Cache Delete Success - Key: ${key}`);
      resolve(true);
    } catch (err) {
      logger.error(`Redis Cache Delete Error - Key ${key}`);
      logger.error(err);
      resolve(false);
    }
  });
};

redisHandler.prototype.getValue = function (key) {
  return new Promise(async (resolve) => {
    try {
      let result = await client.get(key);
      if (result) {
        logger.info(`Redis Cache Get Success - Key:${key}`);
        resolve(result);
      } else {
        logger.info(`Redis Cache Get - Key:${key} - Not Exists`);
        resolve(null);
      }
    } catch (err) {
      logger.error(`Redis Cache Get Error - Key ${key}`);
      logger.error(err);
      resolve(null);
    }
  });
};

redisHandler.prototype.getAllRedisKeys = function () {
  return new Promise(async (resolve) => {
    try {
      let keys = await client.keys("*");
        resolve(keys);
    } catch (err) {
      logger.error(`Getting Redis Cache Keys Error`);
      logger.error(err);
      resolve(null);
    }
  });
};

redisHandler.prototype.getAllRedisKeysStartsWith = function (startsWith) {
  return new Promise(async (resolve) => {
    try {
      let keys = await client.keys(`${startsWith}*`);
        resolve(keys);
    } catch (err) {
      logger.error(`Getting Redis Cache Keys Error`);
      logger.error(err);
      resolve(null);
    }
  });
};

redisHandler.prototype.getServerVersion = function () {
  return new Promise(async (resolve) => {
    try {
      let output = await client.INFO();
      resolve({ [output.slice(10, 23)]: output.slice(24, 29) });
    } catch (err) {
      logger.error(`Getting Redis Version Error`);
      logger.error(err);
      resolve(null);
    }
  });
};

redisHandler.prototype.deleteKeysStartsWith = function (startsWith) {
  return new Promise(async (resolve) => {
    try {
      let keys = await client.keys(`${startsWith}*`);
      if (Array.isArray(keys) && keys.length === 0) {
        resolve(null);
      } else {
        for (var i = 0, j = keys.length; i < j; ++i) {
          await client.del(keys[i]);
          logger.info(`Redis Cache Delete Success - Key: ${keys[i]}`);
        }
        resolve(true);
      }
    } catch (err) {
      logger.error(`Redis Cache Delete(Starts with delete) Error - Key ${startsWith}`);
      logger.error(err);
      resolve(false);
    }
  });
};

module.exports = redisHandler;
