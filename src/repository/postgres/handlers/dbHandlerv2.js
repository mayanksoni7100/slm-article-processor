let async =  require('async');
let { getConnection } = require('./dbConnection');
const uuid = require('uuid');

function dbHandlerv2() {
    return this;
}

dbHandlerv2.prototype.executeCommand = function (sql) {
    return new Promise(resolve => {
        getConnection()
        .any(sql)
        .then((dbResult) => {
            if (dbResult == '') { 
                dbResult = 'success'; 
            }

            if (dbResult == 'success') {
                dbResult = [];
            }

            resolve({
                code: 1,
                msg: 'The command was successful.',
                data: [dbResult]
            });
            return;
        })
        .catch((error) => {
            let uniqueErrorId = uuid.v4();
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand) Query: ${sql}`);
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand): ${error.message}`);
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand): ${JSON.stringify(error)}`);

            resolve({
                code: -1,
                msg: error.message,
                data: error
            });
            return;
        });
    });       
};

dbHandlerv2.prototype.executeCommandWithParams = function (sql, params) {
    return new Promise(resolve => {
        getConnection()
        .any(sql, params)
        .then((dbResult) => {
            if (dbResult == '') { 
                dbResult = 'success'; 
            }

            if (dbResult == 'success') {
                dbResult = [];
            }

            resolve({
                code: 1,
                msg: 'The command was successful.',
                data: [dbResult]
            });
            return;

        })
        .catch((error) => {
            let uniqueErrorId = uuid.v4();
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams) Query: ${sql} and params: ${JSON.stringify(params)}`);
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams): ${error.message}`);
            logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams): ${JSON.stringify(error)}`);
            resolve({
                code: -1,
                msg: error.message,
                data: error
            });
            return;
        });
    });
};

/* Will be used only when, multiple commands (as array or as a batch) at a time to execute */
dbHandlerv2.prototype.executeCommandWithParams_MultipleArray = function(sqlQuery, params, idx) {
    return new Promise(resolve => {
        getConnection()
            .tx((t) => {
                const queries = params.map((parameters) => {
                    // logger.info('Query Parameters:' + JSON.stringify(parameters));
                    return t.none(sqlQuery, parameters);
                });
                return t.batch(queries);
            })
            .then((dbResult) => {
                resolve({
                    code: 1,
                    msg: 'The command was successful.',
                    data: [dbResult]
                });
                return;

            })
            .catch((error) => {
                let uniqueErrorId = uuid.v4();
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams_MultipleArray) Query: ${sqlQuery} and params: ${JSON.stringify(params)}`);
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams_MultipleArray): ${error.message}`);
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommandWithParams_MultipleArray): ${JSON.stringify(error)}`);
                resolve({
                    code: -1,
                    msg: error.message,
                    data: error
                });
                return;
            });
    });
};


/* Will be used only when, multiple commands (as array or as a batch) at a time to execute */
dbHandlerv2.prototype.executeCommand_MultipleArray = function(lstOfCommands, idx) {
    return new Promise(resolve => {
        getConnection()
            .tx((t) => {
                const queries = lstOfCommands.map((l) => {
                    return t.any(l);
                });
                return t.batch(queries);
            })
            .then((data) => {
                resolve({
                    code: 1,
                    msg: 'The command was successful.',
                    data: [data]
                });
                return;
            })
            .catch((error) => {
                let uniqueErrorId = uuid.v4();
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand_MultipleArray) Query: ${JSON.stringify(lstOfCommands)}`);
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand_MultipleArray): ${error.message}`);
                logger.error(`[${uniqueErrorId}] - PostgreSQL2 Database ERROR (executeCommand_MultipleArray): ${JSON.stringify(error)}`);

                resolve({
                    code: -1,
                    msg: error.message,
                    data: error
                });
                return;
            });
        }
    );
};


module.exports = dbHandlerv2;