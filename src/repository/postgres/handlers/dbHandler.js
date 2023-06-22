var async =  require('async');
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
                logger.info('Query Parameters:' + JSON.stringify(params));
                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                logger.info('Query Parameters:' + JSON.stringify(params));
                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                global.rdbms_info
                    .result(sql, params)
                    .then((data) => {
                        logger.info('Rows Affected:' + data.rowCount)

                        // if(process.env.DETAILED_LOGS == 'YES'){
                        //     logger.info('DATA' + '[' + idx + '] :' + JSON.stringify(data));
                        // }

                        callback(null, data);
                    })
                    .catch((error) => {
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                global.rdbms_info
                    .multi(sql)
                    .then((data) => {
                        if (data == '') { data = 'success'; }
                        if (data == 'success') {
                            data = [];
                        }
                        callback(null, data);
                    })
                    .catch((error) => {
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error));
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
                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error)); // print the error;
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

                global.rdbms_info
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
                        logger.error('PostgreSQL Database ERROR:' + error.message);
                        logger.error('PostgreSQL Database ERROR:' + JSON.stringify(error)); // print the error;
                        callback('ERROR', error);
                    });
            };
        })()
    );
};

module.exports = dbHandler;
