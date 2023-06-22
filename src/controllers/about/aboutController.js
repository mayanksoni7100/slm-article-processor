const si = require('systeminformation');
var fs = require('fs');
var dbHandler;

function aboutController() {
    dbHandler = new(require(`../../repository/${process.env.RDBMS_TYPE}/handlers/dbHandler`))();
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

aboutController.prototype.updateReleaseNotes = function(objReleaseNotes){
    return new Promise(resolve => {
        updateReleaseNotes_db(objReleaseNotes).then(function(){
            return executeParallel();
        }).then(function(result) {
            if (result.code == 1) {
                logger.info('Release history updated successfully');
                logger.info(JSON.stringify(result));
            } else {
                logger.info('Release history update failed');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    });
}

function updateReleaseNotes_db(objReleaseNotes){
    var idx = 0;
    var releaseHistoryQueryPath = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/v2/about/updateReleaseHistory.sql`;
    var params = [];
    return new Promise(function (resolved, reject) {
        let releaseHistoryQuery = fs.readFileSync(releaseHistoryQueryPath, 'utf8');
        for(var index = 0; index < objReleaseNotes.releaseHistory.length; index++){
            params.push({
                release_version: objReleaseNotes.releaseHistory[index].releaseVersion,
                release_date: objReleaseNotes.releaseHistory[index].releaseDate,
                microservices_version: JSON.stringify(objReleaseNotes.releaseHistory[index].microServices),
                features: JSON.stringify(objReleaseNotes.releaseHistory[index].features),
                bugs: JSON.stringify(objReleaseNotes.releaseHistory[index].bugs),
                microservices_changes: '{}'
            });
        }
        dbHandler.executeCommandWithParams_MultipleArray(releaseHistoryQuery, params, idx);
        idx++;
        resolved(true);
    });
}

aboutController.prototype.getReleaseHistory = function(){
    return new Promise(resolve => {
        getReleaseHistory_db().then(async function(){
            return executeParallel();
        }).then(function(result) {
            if (result.code == 1) {
                logger.info(`Getting Release History Successful`);
            } else {
                logger.error('Getting Release History Failed');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    })
}

function getReleaseHistory_db(){
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/v2/about/getReleaseHistory.sql`;
    return new Promise(function (resolved, reject) {
        var sqlQuery = fs.readFileSync(path, 'utf8');
        var parameters = {};
        dbHandler.executeCommandWithParams(sqlQuery, parameters, idx);
        idx++;
        resolved(true);
    });
}



aboutController.prototype.getTimezoneInfo = function(){
    return new Promise(resolve => {
        resolve(si.time());
    });
};

aboutController.prototype.getOSInfo = function(){
    let dataToReturn = '';
    return new Promise(resolve => {
        si.osInfo()
        .then(data => {
            dataToReturn = data;
            process.env.CODE_HOST_NAME = data.hostname;
            resolve(data);
        })
        .catch(error => {
            logger.error('Getting OS Information Error:');
            logger.error(error);
            resolve(dataToReturn);
        });
    });
}


aboutController.prototype.updateNextReleaseInfo = function(nextReleaseInfo){
    return new Promise(resolve => {
        updateNextReleaseInfo_db(nextReleaseInfo).then(async function(){
            return executeParallel();
        }).then(function(result) {
            if (result.code == 1) {
                logger.info(`Updating Next Release Info Successful`);
            } else {
                logger.error('Updating Next Release Info Failed');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    })
}

function updateNextReleaseInfo_db(nextReleaseInfo){
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/v2/about/updateNextReleaseInfo.sql`;
    return new Promise(function (resolved, reject) {
        var sqlQuery = fs.readFileSync(path, 'utf8');
        var parameters = {
            nextReleaseInfo: JSON.stringify(nextReleaseInfo)
        };
        dbHandler.executeCommandWithParams(sqlQuery, parameters, idx);
        idx++;
        resolved(true);
    });
}

aboutController.prototype.getNextReleaseInfo = function(){
    return new Promise(resolve => {
        getNextReleaseInfo_db().then(async function(){
            return executeParallel();
        }).then(function(result) {
            if (result.code == 1) {
                logger.info(`Getting Next Release Info Successful`);
            } else {
                logger.error('Getting Next Release Info Failed');
                logger.error(JSON.stringify(result));
            }
            resolve(result);
        });
    })
}

function getNextReleaseInfo_db(){
    var idx = 0;
    var path = `${process.cwd()}/src/repository/${process.env.RDBMS_TYPE}/execute/v2/about/getNextReleaseInfo.sql`;
    return new Promise(function (resolved, reject) {
        var sqlQuery = fs.readFileSync(path, 'utf8');
        var parameters = {};
        dbHandler.executeCommandWithParams(sqlQuery, parameters, idx);
        idx++;
        resolved(true);
    });
}


module.exports = aboutController;