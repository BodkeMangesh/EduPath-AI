const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  // No validation errors
  if (errors.isEmpty()) {
    return next();
  }

  // Format validation errors
  const formattedErrors = errors.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    errors: formattedErrors,
  });
};

module.exports = validateRequest;
