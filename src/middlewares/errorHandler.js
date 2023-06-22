import { generateCommonResponse } from '../utilities/utilities'

var statusCodes = require('../utilities/statusCodes');

export default (error, req, res, next) => {
  res.status(error.status || statusCodes.HTTP_INTERNAL_SERVER_ERROR);
  res.send(generateCommonResponse(-1, error.message));
  next();
}
