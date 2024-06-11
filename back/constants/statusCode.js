const serverError = 500;
const notFound = 404;
const badGateway = 502;
const success = 200;
const unauthorized = 401;
const badRequest = 400;
const userAlreadyExists = 409;
const tooManyRequests = 429;
const notModified = 204;
const fileTooLarge = 413;
const invalidFileType = 415;
const forbidden = 403;

module.exports = {
  serverError,
  notFound,
  badGateway,
  success,
  unauthorized,
  badRequest,
  userAlreadyExists,
  notModified,
  fileTooLarge,
  invalidFileType,
  tooManyRequests,
  forbidden,
};