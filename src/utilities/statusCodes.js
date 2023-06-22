// Http response codes
const HTTP_OK = 200
const HTTP_ACCEPTED = 202
const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_SERVER_ERROR = 500
const HTTP_BAD_REQUEST = 400
const HTTP_NO_CONTENT = 204
const HTTP_CONFLICT = 409
const HTTP_UNPROCESSABLE_ENTITY = 422
const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403
const HTTP_PARAMETER_NOT_ALLOWED = 405
const HTTP_TOO_MANY_REQUESTS = 429

//Common Response codes
const HTTP_AUTHENTICATION_FAILED = 406

// Inner response codes
const SERVER_ERROR_STATUS = "500"
const SUCCESS_STATUS = "200"

// Inner Response Codes Text
const SUCCESS = 'SUCCESS'
const PARTIAL_SUCCESS = 'PARTIAL_SUCCESS'
const FAILED = 'FAILED'
const HTTP_INTERNAL_SERVER_ERROR_MSG = 'INTERNAL_SERVER_ERROR';

// COMMON
const RESULT_SUCCESS = 1
const RESULT_NO_DATA = 10
const RESULT_FAIL = -99
const RESULT_ERROR = -100
const RESULT_UNDEFINED = undefined

// LOG TYPE
const LOG_START = 1
const LOG_END = 2


module.exports = {
  HTTP_OK,
  HTTP_ACCEPTED,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_NO_CONTENT,
  HTTP_CONFLICT,
  HTTP_UNPROCESSABLE_ENTITY,
  HTTP_UNAUTHORIZED,
  HTTP_AUTHENTICATION_FAILED,
  HTTP_FORBIDDEN,
  HTTP_PARAMETER_NOT_ALLOWED,
  HTTP_TOO_MANY_REQUESTS,
  SERVER_ERROR_STATUS,
  SUCCESS_STATUS,
  RESULT_SUCCESS,
  RESULT_NO_DATA,
  RESULT_FAIL,
  RESULT_ERROR,
  RESULT_UNDEFINED,
  LOG_START,
  LOG_END,
  SUCCESS,
  PARTIAL_SUCCESS,
  FAILED,
  HTTP_INTERNAL_SERVER_ERROR_MSG
};
