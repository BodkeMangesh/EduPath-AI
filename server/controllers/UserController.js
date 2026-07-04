const UserService = require("../services/UserService");

class UserController {
  /**
   * Get Current User Profile
   */
  async getProfile(req, res) {
    try {
      const user = await UserService.getProfile(req.user._id);

      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully.",
        data: user,
      });
    } catch (error) {
      console.error("Error in UserController.getProfile:", error);

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update User Profile
   */
  async updateProfile(req, res) {
    try {
      const updatedUser = await UserService.updateProfile(
        req.user._id,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error in UserController.updateProfile:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Change User Password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      await UserService.changePassword(
        req.user._id,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Error in UserController.changePassword:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();
