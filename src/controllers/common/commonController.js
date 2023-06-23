var dbHandler;

function commonController() {
  dbHandler = new (require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
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

var executeSerise = function () {
  // It's Promise
  return new Promise(function (resolved, rejected) {
    dbHandler.execSerise(function (result) {
      resolved(result);
    });
  });
};

commonController.prototype.bytesToHumanReadable = function (bytes) {
  return new Promise((resolve) => {
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    resolve(parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i]);
  });
};

commonController.prototype.getPercentageBetweenValues = function (value1,value2) {
  return new Promise((resolve) => {
    if (value1 && value2 > 0 && value1 <= value2) {
      resolve(`${parseFloat((1 - value1 / value2) * 100).toFixed(2)}%`);
    }
    resolve(false);
  });
};

commonController.prototype.getPostgreSQLVersion = function () {
  return new Promise((resolve) => {
    getPostgreSQLVersion_db()
      .then(function () {
        return executeParallel();
      })
      .then(function (result) {
        if (result.code == 1) {
          logger.info("[COMMON_CONTROLLER :: GET_POSTGRESQL_VERSION] - Getting PostgreSQL Version Successful");
        } else {
          logger.error("[COMMON_CONTROLLER :: GET_POSTGRESQL_VERSION] - Getting PostgreSQL Version Failed");
          logger.error(JSON.stringify(result));
        }
        resolve(result);
      });
  });
};

function getPostgreSQLVersion_db() {
  var idx = 0;
  return new Promise(function (resolved, reject) {
    dbHandler.executeCommandWithParams("select version();", {}, idx);
    idx++;
    resolved(true);
  });
}

commonController.prototype.divideArrayIntoEqualBatches = function(itemsToDivide, itemDivisionNumber){
  return new Promise(resolve => {
      const items = itemsToDivide;
      const equalNumber = itemDivisionNumber;

      const result = new Array(Math.ceil(items.length / equalNumber))
      .fill()
      .map(_ => items.splice(0, equalNumber));

      resolve(result);
  });
}

module.exports = commonController;
