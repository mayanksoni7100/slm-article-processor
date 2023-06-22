const crypto = require('crypto');
const moment = require('moment-timezone')
require('moment-duration-format');

module.exports = (req, res, next) => {
  var temp = res.send;
  res.send = function (responseBody) {
    if (typeof responseBody == 'object') {
      req.responseTime = new Date();
      /* Getting SoluM Origin Request */
      let solumOrigin = req.headers['solum-origin'];
      /* Getting Referer value from request header */
      let referer = req.headers['referer'];
      if(referer){
        if(referer.indexOf('/secured/v2/docs') != -1){
          referer = 'API SERVICE SWAGGER';
        }
        if(referer.indexOf('/square/docs') != -1){
          referer = 'article processor SERVICE SWAGGER';
        }
      }

      if(!solumOrigin){
        if(referer){
          solumOrigin = referer;
        }
      }

      let resBody = null;
      resBody = responseBody;
      if(req.method == 'GET' && (res.statusCode == 200 || res.statusCode == 204)){
        resBody = null;
      }
      try{
        logger.info(`## Request Id: ${req.reqUniqueId}, URL: ${req.method} ${req.url}, Response: ${JSON.stringify(resBody)}, Request Timestamp: ${moment(req.requestDate).format('YYYY-MM-DD HH:mm:ss,SSS')}, Response Timestamp: ${moment(req.responseTime).format('YYYY-MM-DD HH:mm:ss,SSS')} ##`);
      }catch (err) {
        logger.error(`while logging request and response: ${err}`);
      }
    }
    temp.apply(this, arguments);
  }
  next();
  return;
}