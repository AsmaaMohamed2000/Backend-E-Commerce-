
const dotenv=require('dotenv')
dotenv.config()
const app = require('../app');
const connectDB = require('../config/db');
let isConnected = false;

module.exports = async (req, res) => {

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
console.log("Mongo URL exists?", !!process.env.MONGO_URL);
  return app(req, res);

};