const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  /*
   * Generate JWT Token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  /*
   * Register New User
   */
  async register(userData) {
    const { fullName, email, phone, password } = userData;

    // Check existing email
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      throw new Error("Email already exists.", 409);
    }

    // Check existing phone
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      throw new Error("Phone number already exists.", 409);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    // Login User After Registration
    const token = this.generateToken(user._id);
    user.password = undefined;

    return {
      user,
      token,
    };
  }

  async login(email, password) {
    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    // Generate JWT
    const token = this.generateToken(user._id);

    // Remove password from user object before returning
    user.password = undefined;
    return {
      user,
      token,
    };
  }

  /**
   * Logout User
   */
  async logout() {
    return {
      success: true,
      message: "Logged out successfully.",
    };
  }
}

module.exports = new AuthService();
