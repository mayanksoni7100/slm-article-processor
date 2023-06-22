const aboutAPI = require('express').Router();
const bodyParser = require('body-parser');
const v8 = require('v8');
const moment = require('moment-timezone')
require('moment-duration-format');
const si = require('systeminformation');
import {
    generateCommonResponse,
    generateResponseObjectv2
} from  '../../utilities/utilities';

var statusCodes = require('../../utilities/statusCodes');
aboutAPI.use(bodyParser.json());

aboutAPI.get('/v1/about', function(req, res) {
    (async function(){
        try{
            const totalHeapSize = v8.getHeapStatistics().heap_size_limit;
            let totalHeapSizaInMB = (totalHeapSize / 1024 / 1024).toFixed(2);

            logger.info('V8 Total Heap Size in Bytes:' + totalHeapSize.toString());
            logger.info("V8 Total Heap Size: " + totalHeapSizaInMB.toString() + ' MB');

            let baseVersion = process.env.base_version_string ? process.env.base_version_string : '-';
            let squarePosServiceVersion = process.env.apiservice_version_info ? process.env.apiservice_version_info : '-';
            var result = {
                type: 'AIMS article processor SERVICE',
                description: 'Welcome to AIMS SaaS article processor Service',
                instanceId: global.instanceId,
                version: `${baseVersion}.${squarePosServiceVersion}`,
                //nVersion: process.version, // Getting Node.js Version
                hostname: '',
                memorySizeLimit: totalHeapSizaInMB + ' MB',
                memorySizeLimitInBytes: totalHeapSize
            }
            let aboutController = new(require('../../controllers/about/aboutController'))();
            let timeInfoResult = await aboutController.getTimezoneInfo();
            const duration = moment.duration(process.uptime(), 'S').format(" D [days] H [hrs] m [mins] s [secs]");
            result['timeInfo'] = {
                uptime: duration,
                systemTime: moment(new Date()).local().format('YYYY-MM-DD HH:mm:ss'),
                timezone: timeInfoResult.timezone,
                timezoneName: `${moment.tz.guess()}`
            }

            let commonController = new(require('../../controllers/common/commonController'))();
            result['memoryInfo'] = {
                rss: await commonController.bytesToHumanReadable(process.memoryUsage().rss),
                heapTotal: await commonController.bytesToHumanReadable(process.memoryUsage().heapTotal),
                heapUsed: await commonController.bytesToHumanReadable(process.memoryUsage().heapUsed),
                external: await commonController.bytesToHumanReadable(process.memoryUsage().external)
            };

            aboutController = new(require('../../controllers/about/aboutController'))();
            let osInfo = await aboutController.getOSInfo();
            result.hostname = osInfo.hostname;
            logger.info('About API Response:' + JSON.stringify(result));

            if(req.query.techStackVersion){
                if(req.query.techStackVersion == 'true'){
                    commonController = new(require('../../controllers/common/commonController'))();
                    let postgreSqlVersionResult = await commonController.getPostgreSQLVersion();
                    let pgVersion = '-';
                    if(postgreSqlVersionResult.code == 1){
                        pgVersion = postgreSqlVersionResult.version;
                    }

                    result['techStackVersion'] = {
                        nodeJsVer: process.version,
                        javaVer: '-',
                        postgreSqlDatabaseVer: pgVersion,
                        mongoDatabaseVer: '-'
                    }
                }
            }



            res.status(statusCodes.HTTP_OK).send({
                ...result,
                responseCode: statusCodes.HTTP_OK.toString(),
                responseMessage: statusCodes.SUCCESS
            });
            return;
        }catch(error){
            logger.error('About API - Error');
            logger.error(error);
            let response = generateCommonResponse(statusCodes.SERVER_ERROR_STATUS, error);
            res.status(statusCodes.HTTP_INTERNAL_SERVER_ERROR).send(response);
            return;
        }
    })();
});

export default aboutAPI;