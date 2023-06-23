var dbHandler;
var fs = require('fs');

function inputDataController(){
    dbHandler = new(require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
    return this;
}

inputDataController.prototype.updateInputData = function(inputData){
    return new Promise((resolved) => {
            try{
                // updateInputData_db(inputData).then(function(){
                //     return executeParallel();
                // }).then(function(result) {
                //     resolved(result);
                // });

                resolved({
                    code: 1,
                    msg: 'success',
                    data: []
                });

            }catch(err){
                logger.error(`Updating Input Data Error`);
                logger.error(err);
                resolved(false);
            }
    });
}

function updateInputData_db(inputData) {
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/inputData/updateInputData.sql`;
    return new Promise(function (resolved, reject) {
        var sqlQuery = fs.readFileSync(path, 'utf8');
        var parameters = {
            txsequence: inputData.txSequence,
            type: inputData.type,
            status: inputData.status
        }
        dbHandler.executeCommandWithParams(sqlQuery, parameters, idx);
        idx++;
        resolved(true);
    });
}

module.exports = inputDataController;