const { errorResponse } = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {
  const logger = require("../utils/logger");

  logger.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = "INTERNAL_SERVER_ERROR";
  let errors = err.errors || null;

  /**
   * MongoDB Duplicate Key
   */
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";

    const field = Object.keys(err.keyValue)[0];

    message = `${field} already exists.`;

    errors = [
      {
        field,
        message,
      },
    ];
  }

  /**
   * Invalid Mongo ObjectId
   */
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";

    message = `Invalid ${err.path}.`;
  }

  /**
   * Mongoose Validation
   */
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";

    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    message = "Validation failed.";
  }

  /**
   * JWT Invalid
   */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";

    message = "Invalid token.";
  }

  /**
   * JWT Expired
   */
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";

    message = "Token has expired.";
  }

  return errorResponse(res, statusCode, message, {
    code,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
