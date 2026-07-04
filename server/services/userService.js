const User = require("../models/User");

class UserService {
  /**
   * Get Current User Profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }

  /**
   * Update User Profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    // Prevent updating protected fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    Object.assign(user, updateData);

    await user.save();

    return user;
  }

  /**
   * Change User Password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    user.password = newPassword;

    await user.save();

    return true;
  }
}

module.exports = new UserService();
