import moment from 'moment';
import winston from 'winston';
import fs from 'fs';
require('winston-daily-rotate-file');
const applicationEnv = require('lodash');
const si = require('systeminformation');
global.logger = null;

const applicationLogger = rTracer => {

    process.env.CODE_HOST_NAME = 'ARTICLE_PROCESSOR_SERVICE';
    si.osInfo()
        .then(data => {
            process.env.CODE_HOST_NAME = data.hostname;
        })
        .catch(error => {
           logger.error('Error while getting host name');
           logger.error(error);
        });

    const loggertimestamp = () => moment().format('YYYY-MM-DD HH:mm:ss,SSS');
    const { createLogger, format } = require('winston');
    const { combine, timestamp, label, printf } = format;

    const myFormat = printf((info) => {
        const rid = rTracer.id()
        return rid
            ? `${loggertimestamp()} [${process.env.CODE_HOST_NAME}] [${rid}] ${info.level.toUpperCase()}: ${info.message}`
            : `${loggertimestamp()} [${process.env.CODE_HOST_NAME}] ${info.level.toUpperCase()}: ${info.message}`;
    });

    var logfilePath = new winston.transports.DailyRotateFile({
        dirname: './log',
        filename: 'article_processor_service-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: process.env.MAX_SIZE_PER_LOG,
        maxFiles: process.env.MAX_DAYS_TO_KEEP_LOGS,
        handleExceptions: true
    });

    var consoleLog = new winston.transports.Console({});


    var logTransports = [];
    logTransports.push(consoleLog);
    logTransports.push(logfilePath);

    global.logger = createLogger({
        format: combine(
            // label({
            //     label: 'ARTICLE_PROCESSOR_SERVICE'
            // }),
            timestamp(),
            format.splat(),
            myFormat
        ),
        transports: logTransports,
        exitOnError:false
    });

    /* Logging Application Properties */
    logger.info('======================== Application Properites - START ========================');
    let developmentPropertyCame = false;
    applicationEnv.each(process.env, (value, key) => {
        if(key == 'NODE_ENV'){
            developmentPropertyCame = true;
        }

        if(developmentPropertyCame){
            global.logger.info(`Property - [${key}] && Value - [${value}]`);
        }

    });
    logger.info('======================== Application Properites - END ========================');
}


export default applicationLogger;