require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Career = require("../models/Career");

const checkCareerData = async () => {
  try {
    console.log("\n========================================");
    console.log("       CAREER DATA CHECK");
    console.log("========================================\n");

    await connectDB();

    const careers = await Career.find({}).lean();

    if (!careers.length) {
      console.log("❌ No career documents found.");
      return;
    }

    for (const career of careers) {
      console.log("----------------------------------------");
      console.log(`Career Name : ${career.name}`);
      console.log(`Mongo ID    : ${career._id}`);
      console.log(`Slug        : ${career.slug}`);
      console.log(`careerId    : ${career.careerId || "MISSING"}`);
      console.log(
        `Roadmap     : ${
          Array.isArray(career.roadmap)
            ? `FOUND (${career.roadmap.length} phases)`
            : "MISSING"
        }`,
      );
      console.log(`isActive    : ${career.isActive ? "YES" : "NO"}`);
    }

    console.log("\n========================================");
    console.log("       CHECK COMPLETED");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Career data check failed.");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
};

checkCareerData();
