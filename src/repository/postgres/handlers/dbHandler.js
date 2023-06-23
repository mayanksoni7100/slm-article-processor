var async =  require('async');
let { getConnection } = require('./dbConnection');
const uuid = require('uuid');

function dbHandler() {
    this.tasks = [];
    return this;
}

dbHandler.prototype.execSerise = function (callback) {
    async.series(this.tasks, function (err, results) {
        if (err) {
            callback({
                code: -1,
                msg: results[results.length - 1],
                data: results
            });
        } else {
            callback({
                code: 1,
                msg: 'The command was successful.',
                data: results
            });
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
};

dbHandler.prototype.execParallel = function (callback) {
    async.parallel(this.tasks, function (err, results) {
        if (err) {
            callback({
                code: -1,
                msg: results[results.length - 1],
                data: results
            });
        } else {
            callback({
                code: 1,
                msg: 'The command was successful.',
                data: results
            });
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
};


dbHandler.prototype.executeParallelforQueue = function (callback) {
    async.parallel(this.tasks, function (err, results) {
        if (err) {
            callback({
                code: -1,
                msg: results[results.length - 1],
                data: results
            });
        } else {
            callback({
                code: 1,
                msg: 'The command was successful.',
                data: results
            });
        }
        this.tasks = [];
        this.tasks.length = 0;
    });
};

dbHandler.prototype.execParallelBugFix = function (callback) {
    async.parallel(this.tasks, function (err, results) {
        if (err) {
            callback({
                code: -1,
                msg: results[results.length - 1],
                data: results
            });
        } else {
            callback({
                code: 1,
                msg: 'The command was successful.',
                data: results
            });
        }
    });
    this.tasks = [];
};

dbHandler.prototype.execImmediateCommandWithParams = function (sql, params, callback) {
    let task = [];

    let idx = 0;
    task.push(
        (function () {
            return function (callback) {
                // logger.info('Execute SQL : ' + sql);
                // logger.info('Query Parameters:' + JSON.stringify(params));
                getConnection()
                    .any(sql, params)
                    .then((data) => {
                        if (data == '') { data = 'success'; }

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);

                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (execImmediateCommandWithParams) Query: ${sql} and params: ${JSON.stringify(params)}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (execImmediateCommandWithParams): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (execImmediateCommandWithParams): ${JSON.stringify(error)}`);

                        callback('ERROR', error);
                    });
            };
        }
        )()
    );
    async.parallel(task, function (err, results) {
        if (err) {
            callback({
                code: -1,
                msg: results[results.length - 1],
                data: results
            });
        } else {
            callback({
                code: 1,
                msg: 'The command was successful.',
                data: results
            });
        }
    });
};

/* Will be used only when, one command at a time to execute */
dbHandler.prototype.executeCommand = function (sql, idx) {
    this.tasks.push(
        (function () {
            return function (callback) {
                // logger.info('Execute SQL : ' + sql);
                getConnection()
                    .any(sql)
                    .then((data) => {
                        if (data == '') { data = 'success'; }

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);

                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand) Query: ${sql}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand): ${JSON.stringify(error)}`);

                        callback('ERROR', error);
                    });
            };
        })()
    );
};

dbHandler.prototype.executeCommandv2 = function (sql, idx) {
    this.tasks.push(
        (function () {
            return function (callback) {
                getConnection()
                    .any(sql)
                    .then((data) => {
                        if (data == '') { data = 'success'; }

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);

                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandv2) Query: ${sql}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandv2): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandv2): ${JSON.stringify(error)}`);

                        callback('ERROR', error);
                    });
            };
        })()
    );
};

dbHandler.prototype.executeCommandWithParams = function (sql, params, idx) {
    this.tasks.push(
        (function () {
            return function (callback) {
                // logger.info('Execute SQL : ' + sql);
                // logger.info('Query Parameters:' + JSON.stringify(params));
                getConnection()
                    .any(sql, params)
                    .then((data) => {
                        if (data == '') { data = 'success'; }

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);

                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams) Query: ${sql} and params: ${JSON.stringify(params)}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams): ${JSON.stringify(error)}`);
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

/* Use this function when you want to know, how many rows affected like update / delete */
dbHandler.prototype.executeCommandUpdateDelete = function (sql, params, idx) {
    this.tasks.push(
        (function () {
            return function (callback) {
                // logger.info('Execute SQL : ' + sql);
                getConnection()
                    .result(sql, params)
                    .then((data) => {
                        logger.info('Rows Affected:' + data.rowCount)

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        callback(null, data);
                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandUpdateDelete) Query: ${sql} and params: ${JSON.stringify(params)}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandUpdateDelete): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandUpdateDelete): ${JSON.stringify(error)}`);
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

/* Will be used only when, multiple commands (separated by semicolon) at a time to execute */
dbHandler.prototype.executeCommand_Multiple = function(sql, idx) {
    this.tasks.push(
        (function() {
            return function(callback) {
                // logger.info('Execute SQL : ' + sql);
                getConnection()
                    .multi(sql)
                    .then((data) => {
                        if (data == '') { data = 'success'; }
                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);
                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_Multiple) Query: ${sql}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_Multiple): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_Multiple):' ${JSON.stringify(error)}`);
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

/* Will be used only when, multiple commands (as array or as a batch) at a time to execute */
dbHandler.prototype.executeCommand_MultipleArray = function(lstOfCommands, idx) {
    this.tasks.push(
        (function() {
            return function(callback) {
                getConnection()
                    .tx((t) => {
                        const queries = lstOfCommands.map((l) => {
                            return t.any(l);
                        });
                        return t.batch(queries);
                    })
                    .then((data) => {
                        callback(null, data);
                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_MultipleArray) Query: ${JSON.stringify(lstOfCommands)}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_MultipleArray): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommand_MultipleArray): ${JSON.stringify(error)}`);
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

/* Will be used only when, multiple commands (as array or as a batch) at a time to execute */
dbHandler.prototype.executeCommandWithParams_MultipleArray = function(sqlQuery, params, idx) {
    this.tasks.push(
        (function() {
            return function(callback) {
                // logger.info('Execute SQL : ' + sqlQuery);

                getConnection()
                    .tx((t) => {
                        const queries = params.map((parameters) => {
                            // logger.info('Query Parameters:' + JSON.stringify(parameters));
                            return t.none(sqlQuery, parameters);
                        });
                        return t.batch(queries);
                    })
                    .then((data) => {
                        callback(null, data);
                    })
                    .catch((error) => {
                        let uniqueErrorId = uuid.v4();
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams_MultipleArray) Query: ${sqlQuery} and params: ${JSON.stringify(params)}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams_MultipleArray): ${error.message}`);
                        logger.error(`[${uniqueErrorId}] - PostgreSQL Database ERROR (executeCommandWithParams_MultipleArray): ${JSON.stringify(error)}`);
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

module.exports = dbHandler;
