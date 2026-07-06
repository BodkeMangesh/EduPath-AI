const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { chat } = require("../controllers/chatController");

console.log("protect:", protect);
console.log("chat:", chat);

router.post("/", protect, chat);

module.exports = router;
