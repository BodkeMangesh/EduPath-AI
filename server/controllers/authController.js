const AuthService = require("../services/AuthService");

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
}

module.exports = new AuthController();
