var async =  require('async');
var { generateResponseObject } = require('../../../utilities/utilities')
var CODE = require('../../../utilities/statusCodes');
const parallelStoreCount = process.env.NOSQL_STATISTICS_PARALLEL_STORE_COUNT;

function noSQLHandler() {
    this.tasks = [];
    return this;
}

noSQLHandler.prototype.execWaterfall = function (callback) {
    logger.info(this.tasks.length);
    async.series(this.tasks, function (err, results) {
        if (err) {
            callback(generateResponseObject(CODE.RESULT_FAIL, results[results.length - 1], results));
        } else {
            callback(generateResponseObject(CODE.RESULT_SUCCESS, 'success', results));
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
}

noSQLHandler.prototype.execSerise = function (callback) {
    async.series(this.tasks, function (err, results) {
        if (err) {
            callback(generateResponseObject(CODE.RESULT_FAIL,results[results.length - 1], results));
        } else {
            callback(generateResponseObject(CODE.RESULT_SUCCESS ,'success', results));
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
};

noSQLHandler.prototype.execParallel = function (callback) {
    async.parallel(this.tasks, function (err, results) {
        if (err) {
            /* Join the result after finish the parallel processing*/
            callback(generateResponseObject(CODE.RESULT_FAIL, results[results.length - 1], results));
        } else {
            callback(generateResponseObject(CODE.RESULT_SUCCESS, 'success', results));
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
};

noSQLHandler.prototype.execParallelBugFix = function (callback) {
    async.parallel(this.tasks, function (err, results) {
        if (err) {
            /* Join the result after finish the parallel processing*/
            callback(generateResponseObject(CODE.RESULT_FAIL, results[results.length - 1], results));
        } else {
            callback(generateResponseObject(CODE.RESULT_SUCCESS, 'success', results));
        }
    });
    this.tasks = [];
    logger.info("tasks clear");
};

noSQLHandler.prototype.execParallelLimitBugFix = function (callback) {
    async.parallelLimit(this.tasks, parallelStoreCount, function (err, results) {
        if (err) {
            /* Join the result after finish the parallel processing*/
            callback(generateResponseObject(CODE.RESULT_FAIL, results[results.length - 1], results));
        } else {
            callback(generateResponseObject(CODE.RESULT_SUCCESS, 'success', results));
        }
    });
};

noSQLHandler.prototype.clearTasks = function (callback) {
    this.tasks = [];
    logger.info("tasks clear");
}

noSQLHandler.prototype.getTasksCount = function (callback) {
    logger.info("tasks count: " + this.tasks.length);
}

noSQLHandler.prototype.pushTask = function (paramFunc,param_customer_cd,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                logger.info("Entered push Task");
                paramFunc(param_customer_cd,callback);
            };
        })(idx)
    );
};

noSQLHandler.prototype.pushTaskForPurge = function (paramFunc,param_customer_cd,param_store_cd,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                logger.info("Entered push Task");
                paramFunc(param_customer_cd,param_store_cd,callback);
            };
        })(idx)
    );
};

noSQLHandler.prototype.pushTaskForStatistics = function (paramFunc,param_customer_cd,param_store_cd,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                logger.info("Entered push Task for statistics");
                paramFunc(param_customer_cd,param_store_cd,callback);
            };
        })(idx)
    );
};

noSQLHandler.prototype.pushTaskForStoreStatistics = function (paramFunc,param_customer_cd,param_store_cd,param_store_zone_id,idx) {
    // if (this.tasks.length >= 50) {
    //     this.execParallelBugFix(function (result) {
    //         logger.info("tasks executed");
    //     });
    // }
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                logger.info("Entered push Task for statistics");
                paramFunc(param_customer_cd,param_store_cd,param_store_zone_id,callback);
            };
        })(idx)
    );
};
/*
 * It's for WOW Specific function for Report to customer
 */
noSQLHandler.prototype.pushTaskForWOWReport = function (paramFunc,param_customer_cd,param_store_cd,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                logger.info("Entered push Task for wow report for store [" + param_store_cd + "]");
                paramFunc(param_customer_cd,param_store_cd,callback);
            };
        })(idx)
    );
};

//noSQLHandler.prototype.pushMakeDetailRecord = function (paramFunc,param_customer_cd,param_store_cd,param_labelCode,idx) {
noSQLHandler.prototype.pushUnReportedBatch = function (paramFunc,paramBatch,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                //logger.info("Entered push Task for statistics");
                paramFunc(paramBatch,callback);
            };
        })(idx)
    );
};

noSQLHandler.prototype.pushIncomplatedBatch = function (paramFunc,param_customer_cd,param_store_cd,paramBatch,idx) {
    this.tasks.push(
        (function (idx) {
            return function (callback) {
                //logger.info("Entered push Task for statistics");
                paramFunc(param_customer_cd,param_store_cd,paramBatch,callback);
            };
        })(idx)
    );
};

module.exports = noSQLHandler;
