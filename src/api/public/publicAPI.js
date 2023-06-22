const publicAPI = require('express').Router();
const bodyParser = require('body-parser');
const v8 = require('v8');
const moment = require('moment-timezone')
require('moment-duration-format');
require('express-zip');

import {
    generateResponseObjectv2
} from  '../../utilities/utilities';

var statusCodes = require('../../utilities/statusCodes');
publicAPI.use(bodyParser.json());

const path = require('path');
const fs = require('fs');

publicAPI.get('/', function (req, res) {
    res.status(statusCodes.HTTP_OK).send(`<html>
        <meta charset="UTF-8">
        <title>API Services</title>
        <head>
        <style>
        @import url('https://fonts.googleapis.com/css?family=Poppins');
    
        /* BASIC */
        html {
            background-color: #0A263F;
        }
    
        body {
            font-family: "Poppins", sans-serif;
            height: 100vh;
        }
        .wrapper {
            display: flex;
            align-items: center;
            flex-direction: column;
            width: 100%;
            min-height: 100%;
            padding: 20px;
        }
        #formContent {
            -webkit-border-radius: 10px 10px 10px 10px;
            border-radius: 10px 10px 10px 10px;
            background: #fff;
            padding: 30px;
            width: 90%;
            max-width: 950px;
            position: relative;
            padding: 0px;
            -webkit-box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
            box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
            text-align: center;
            align-content: center;
        }
        * {
            box-sizing: border-box;
        }
    
        .styled-table {
            border-collapse: collapse;
            margin: 0 auto;
            font-size: 0.9em;
            font-family: sans-serif;
            min-width: 400px;
           
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        }
        .styled-table thead tr {
            background-color: #0C263F;
            color: #ffffff;
            text-align: left;
        }
        .styled-table th,
    .styled-table td {
        padding: 18px 15px;
    }
    .styled-table tbody tr {
        border-bottom: 1px solid #dddddd;
    }
    
    .styled-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    
    .styled-table tbody tr:last-of-type {
        border-bottom: 2px solid #0C263F;
    }
    .styled-table tbody tr.active-row {
        font-weight: bold;
        color: #0C263F;
    }
    
    .customh4{
        margin-bottom: 0px !important;
    }
    
    </style>
        </head>
        <body class="swagger-section">
        <div id='header'>
            <div class="swagger-ui-wrap">
                <h1 style="color:#feffff;text-align: center;margin-top:20px;">Welcome to article processor Server</h1>
                <h3 style="color:yellow;text-align: center;margin-top:20px;">
                   ${moment().format('LLLL')} UTC
                </h3>
            </div>
        </div>
    </body>
        </html>`)
});

/* Heartbeat API Request */
publicAPI.get(`/v1/heartbeat`, function (req, res) {
    logMemoryUsage();
    res.status(200).send();
});

function logMemoryUsage(){
    try{
        let memoryObject = process.memoryUsage();
        let rss = bytesToHumanReadable(memoryObject.rss);
        let heapTotal = bytesToHumanReadable(memoryObject.heapTotal);
        let heapUsed = bytesToHumanReadable(memoryObject.heapUsed);
        let external = bytesToHumanReadable(memoryObject.external);

        let memoryLogStmt = `rss: ${rss}, total heap: ${heapTotal}, used heap: ${heapUsed}, external: ${external}`;
        logger.info(`Application memory usage: ${memoryLogStmt}`);
    }catch (err) {
        logger.error('While logging memory statistics');
        logger.error(err);
    }
}

function bytesToHumanReadable(bytes) {
    try{
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }catch(err){
        logger.error('While converting bytes to human readable format');
        logger.error(err);
    }
 }

// /* log files path */
const logDirectoryPath = path.join(process.cwd(), 'log');
publicAPI.get(`/logs/download/all/files`, function(req, res) {
    try{
        fs.readdir(logDirectoryPath, function (err, files) {
            //handling error
            if (err) {
                res.status(statusCodes.HTTP_INTERNAL_SERVER_ERROR).send(generateResponseObjectv2(statusCodes.HTTP_INTERNAL_SERVER_ERROR.toString(), err));
                return;
            }

            let logFileNames = [];
            files.forEach(function (file) {
                logFileNames.push({
                    path: logDirectoryPath + '/'+ file,
                    name: file
                });
            });
            /* Library will zip all log files once and download the zip file */
            if(logFileNames.length > 0){
                res.zip(logFileNames, 'article-processor-logs.zip');
                return;
            }else{
                res.status(statusCodes.HTTP_OK).send(generateResponseObjectv2(statusCodes.HTTP_OK, "NO_LOG_FILES_TO_DOWNLOAD"));
                return;
            }
        });
    }catch(err){
        logger.error('All Log Files Downad Error');
        logger.error(err);
        res.status(statusCodes.HTTP_INTERNAL_SERVER_ERROR).send(generateResponseObjectv2(statusCodes.HTTP_INTERNAL_SERVER_ERROR, err));
    }

});

/* Version */
publicAPI.get('/v1/version', function(req, res) {
    let baseVersion = process.env.base_version_string ? process.env.base_version_string : '-';
    let schedulerVersion = process.env.squarepos_version_info ? process.env.squarepos_version_info : '-';
    let schedulerReleaseDate = process.env.release_date ? process.env.release_date : '-.-'
    let result = {
        name: 'article processor Service',
        version: `${baseVersion}.${schedulerVersion}`,
        releaseDate: schedulerReleaseDate
    }
    try{
        result.version = `${baseVersion}.${schedulerVersion}`;
        res.status(statusCodes.HTTP_OK).send(result);
    }catch(err){
        logger.error('Getting Version Info');
        logger.error(err);
        result.version = `${baseVersion}.${schedulerVersion}`;
        res.status(statusCodes.HTTP_OK).send(result);
    }
});

export default publicAPI;