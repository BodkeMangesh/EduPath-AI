const { body } = require("express-validator");

exports.registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters."),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required.")
    .isLength({ min: 10, max: 15 })
    .withMessage("Invalid phone number."),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email."),

  body("password").notEmpty().withMessage("Password is required."),
];
