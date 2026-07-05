const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const assessmentRoutes = require("./routes/assessmentRoutes");
const learningRoutes = require("./routes/learningRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorHandler);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Health Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduPath AI Server is Running 🚀",
  });
});

module.exports = app;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorHandler);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);