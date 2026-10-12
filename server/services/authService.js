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

  /*
   * Forgot Password
   */
  async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Do not reveal whether the email exists.
    if (!user) {
      return {
        message:
          "If an account exists with this email, password reset instructions will be sent.",
      };
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash of the token.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // Configure this frontend URL in the server .env file.
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      throw new Error("Password reset is not configured.");
    }

    const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail(user, resetUrl);
    } catch (error) {
      // Invalidate the token if email delivery fails.
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      throw error;
    }

    return {
      message:
        "If an account exists with this email, password reset instructions will be sent.",
    };
  }

  /*
   * Reset Password
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword || !newPassword.trim()) {
      throw new Error("A valid token and new password are required.");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new Error("Password reset link is invalid or has expired.");
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return {
      message: "Password has been reset successfully. Please log in.",
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const error = new Error(
        "Current password and new password are required.",
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      const error = new Error("Invalid password format.");
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error(
        "New password must contain at least 8 characters.",
      );
      error.statusCode = 400;
      throw error;
    }

    if (currentPassword === newPassword) {
      const error = new Error(
        "New password must be different from the current password.",
      );
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      const error = new Error("Current password is incorrect.");
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;

    // User model's pre-save hook automatically hashes the password.
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return {
      success: true,
      message: "Password changed successfully.",
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
