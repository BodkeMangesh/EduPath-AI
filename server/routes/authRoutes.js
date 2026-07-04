const express = require("express");
const AuthController = require("../controllers/AuthController");

const validate = require("../middleware/validationMiddleware");

const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidator");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Register User
router.post("/register", registerValidation, validate, AuthController.register);
// Login User
router.post("/login", loginValidation, validate, AuthController.login);
// Logout User
router.post("/logout", AuthController.logout);

module.exports = router;
