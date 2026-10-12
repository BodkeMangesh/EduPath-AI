const AuthService = require("../services/authService");

class AuthController {
  /**
   * Register User
   */
  async register(req, res) {
    try {
      const userData = req.body;

      const result = await AuthService.register(userData);

      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error in AuthController.register:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  /**
   * Login User
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (error) {
      console.error("Error in AuthController.login:", error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Logout User
   */
  async logout(req, res) {
    try {
      const result = await AuthService.logout();

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in AuthController.logout:", error);

      return res.status(500).json({
        success: false,
        message: "Logout failed.",
      });
    }
  }

  /*
   * Forgot Password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      const result = await AuthService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in AuthController.forgotPassword:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to process your request right now.",
      });
    }
  }

  /*
   * Reset Password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (
        typeof token !== "string" ||
        !token.trim() ||
        typeof newPassword !== "string" ||
        newPassword.length < 8
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid token and a password of at least 8 characters are required.",
        });
      }

      const result = await AuthService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in AuthController.resetPassword:", error.message);

      const isInvalidToken =
        error.message === "Password reset link is invalid or has expired.";

      return res.status(isInvalidToken ? 400 : 500).json({
        success: false,
        message: isInvalidToken
          ? error.message
          : "Unable to reset your password right now.",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const result = await AuthService.changePassword(
        req.user._id,
        currentPassword,
        newPassword,
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode
          ? error.message
          : "Unable to change password. Please try again.",
      });
    }
  }
}

module.exports = new AuthController();
