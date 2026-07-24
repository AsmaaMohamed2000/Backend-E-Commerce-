const app = require('../api');
const connectDB = require('../config/db');

let isConnected = false;

module.exports = async (req, res) => {

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return app(req, res);

};