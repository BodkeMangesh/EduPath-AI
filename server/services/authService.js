const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const EmailService = require("./EmailService");

class AuthService {
  /*
   * Generate JWT Token
   */

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  generateOnboardingToken(userId) {
    return jwt.sign({ userId, purpose: "onboarding" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
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
      throw new Error("Email already exists.");
    }

    // Check existing phone
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      throw new Error("Phone number already exists.");
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user FIRST
    const user = await User.create({
      fullName,
      email,
      phone,
      password,

      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,

      onboardingCompleted: false,
    });

    // Send welcome email AFTER user is created
    try {
      await EmailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error("Welcome email failed:", error.message);
    }

    // Generate JWT
    const onboardingToken = this.generateOnboardingToken(user._id);

    user.password = undefined;

    return {
      user,
      onboardingToken,
    };
  }

  async login(email, password) {
    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Check account status
    if (user.accountStatus !== "active") {
      throw new Error("Your account is not active.");
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    // Update last login
    user.lastLogin = new Date();

    await user.save();

    
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
