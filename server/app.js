const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Health Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduPath AI Server is Running 🚀",
  });
});

module.exports = app;
