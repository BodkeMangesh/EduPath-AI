const User = require("../models/User");
const Career = require("../models/Career");

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

  async selectCareer(userId, careerId) {
    // 1. Check if career exists
    const career = await Career.findById(careerId);

    if (!career) {
      throw new Error("Career not found.");
    }

    // 2. Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        selectedCareer: careerId,
        careerStatus: "selected",
        careerSelectedAt: new Date(), // if you added this field
      },
      {
        new: true,
      },
    ).populate("selectedCareer");

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }
}

module.exports = new UserService();
