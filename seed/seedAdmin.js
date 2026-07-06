const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const adminExists = await User.findOne({
      email: "moa719167@gmail.com",
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);

    await User.create({
      username: "Admin",
      email: "moa719167@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      phone:+211111111111
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedAdmin();