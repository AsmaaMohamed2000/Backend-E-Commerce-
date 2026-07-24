// api/index.js
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const connectDB = require('../config/db');

let isConnected = false;

module.exports = async (req, res) => {
  // طباعة سريعة لمعرفة حالة المتغيرات عند كل طلب
  console.log("--- New Request Received ---");
  console.log("Mongo URL exists?", !!process.env.MONGO_URL);

  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("MongoDB connection established successfully.");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
    }
  }

  return app(req, res);
};