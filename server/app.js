const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const assessmentRoutes = require("./routes/assessmentRoutes");
const learningRoutes = require("./routes/learningRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");

const studySessionRoutes = require("./routes/studySessionRoutes");
const careerRoutes = require("./routes/careerRoutes");
const errorHandler = require("./middleware/errorHandler");
const notificationRoute = require("./routes/notificationRoute");
const careerExplorerRoutes = require("./routes/CareerExplorerRoutes");
const careerSelectionRoutes = require("./routes/careerSelectionRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const placementRoutes = require("./routes/placementRoutes");
const resumeAnalyzerRoutes = require("./routes/resumeAnayzerRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
//app.use(rateLimit());
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/learning-progress", learningProgressRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use(errorHandler);
app.use("/api/v1/study-session", studySessionRoutes);
app.use("/api/v1/careers", careerRoutes);
app.use(apiLimiter);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/career-explorer", careerExplorerRoutes);
app.use("/api/v1/career-selection", careerSelectionRoutes);
app.use("/api/v1/roadmap", roadmapRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/placement", placementRoutes);
app.use("/api/v1/resume-analyzer", resumeAnalyzerRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Health Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduPath AI Server is Running 🚀",
  });
});

module.exports = app;
