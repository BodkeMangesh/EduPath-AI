const jwt = require("jsonwebtoken");

const onboardingAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Onboarding token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure this is an onboarding token
    if (decoded.purpose !== "onboarding") {
      return res.status(401).json({
        success: false,
        message: "Invalid onboarding token.",
      });
    }

    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    console.error("Onboarding Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired onboarding token.",
    });
  }
};

module.exports = onboardingAuth;
