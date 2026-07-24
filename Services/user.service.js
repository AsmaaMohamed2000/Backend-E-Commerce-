const User = require("../models/user.model");
const uploade = require("../middlewares/uploads");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const AppError = require("../errors/AppError");
const uploadCloudinary = require("../utilities/cloudinary");
const { USER_ERRORS, USER_SUCCESS } = require("../constants/errors");
const sendEmail = require("../utilities/sendEmail");
const bcrypt = require("bcryptjs");
const { json } = require("express");
const userService = {
  addUser: async (data) => {
    const { username, email, password, phone, role } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(USER_ERRORS.USER_ALREADY_EXISTS, 409);
    }

    const user = await User.create({
      username,
      email,
      password,
      phone,
      role,
      isVerified: true,
    });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        resetUrl: resetLink,
        subject: "set-password",
        type: "set-password",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Failed to send email", 500);
    }

    return {
      success: true,
      message: USER_SUCCESS.USER_CREATED,
      data: user,
    };
  },
  getAllUsers: async ({ page, limit, search, sort, role, isVerified }) => {
  
      page = Math.max(Number(page) || 1,1);
    limit = Math.min(Math.max(Number(limit) || 10,1),100);
    const skip = (page - 1) * limit;
  
    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified==='true' ||isVerified===true;
    }

    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith("-") ? -1 : 1;

    const totalUsers = await User.countDocuments(filter);
     const users = await User.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    return {
      success: true,
      pagination: {
        page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
      data: users,
    };
  },

  getUserById: async (id) => {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
    }

    return {
      success: true,
      data: user,
    };
  },
  deleteUser: async (id, currentUser) => {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
    }
    if (currentUser.id.toString() === id.toString()) {
      throw new AppError(USER_ERRORS.CANNOT_DELETE_SELF, 400);
    }
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    await user.deleteOne();

    return {
      success: true,
      message: USER_SUCCESS.USER_DELETED,
    };
  },
  updateUser: async (id, currentUser, data, file) => {
    if (!data || (Object.keys(data).length === 0 && !file)) {
      throw new AppError(USER_ERRORS.DATA_EMPTY, 400);
    }
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
    }

    const isAdmin = currentUser.role === "admin";
    const isOwner = currentUser?.id?.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(USER_ERRORS.UNAUTHORIZED, 403);
    }

    const updates = {};
  
if (data.email !== undefined && isAdmin) {
  const emailExists = await User.findOne({
    email: data.email,
    _id: { $ne: id },
  });

  if (emailExists) {
    throw new AppError(USER_ERRORS.USER_ALREADY_EXISTS, 409);
  }

  updates.email = data.email;
}

    if (data.username !== undefined) {
      updates.username = data.username;
    }

    if (data.phone !== undefined) {
      updates.phone = data.phone;
    }

    if (isAdmin) {
      if (data.role !== undefined) {
        throw new AppError(USER_ERRORS.ROLE_ROUTE, 400);
      }

      if (data.isVerified !== undefined) {
        updates.isVerified = data.isVerified;
      }
    }

    if (data.addresses !== undefined) {
    try{
        data.addresses=typeof data.addresses==='string'?JSON.parse(data.addresses):data.addresses
   
    }  catch(err){
        throw new AppError(USER_ERRORS.INVALID_ADDRESSES, 400);
    } if (!Array.isArray(data.addresses)) {
        throw new AppError(USER_ERRORS.INVALID_ADDRESSES, 400);
      }

      const defaultAddresses = data.addresses.filter(
        (address) => address.isDefault,
      );

      if (defaultAddresses.length > 1) {
        throw new AppError(USER_ERRORS.MULTIPLE_DEFAULT_ADDRESSES, 400);
      }

      updates.addresses = data.addresses;
    }
const oldImg=user.avatar?.publicId
    if (file) {
      const image = await uploadCloudinary(file.buffer, "users");

    

      updates.avatar = {
        url: image.secure_url,
        publicId: image.public_id,
      };
    }

  

    Object.assign(user, updates);

    await user.save();
      if (file && oldImg) {
        await cloudinary.uploader.destroy(oldImg);
      }

    return {
      success: true,
      message: USER_SUCCESS.USER_UPDATED,
      data: user,
    };
  },
  changePassword: async (id, data) => {
    if (!data) {
      throw new AppError(USER_ERRORS.PASSWORDS_REQUIRED, 400);
    }
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new AppError(USER_ERRORS.PASSWORDS_REQUIRED, 400);
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new AppError(USER_ERRORS.INCORRECT_PASSWORD, 400);
    }
    const samePassword = await user.comparePassword(newPassword);

    if (samePassword) {
      throw new AppError(USER_ERRORS.SAME_PASSWORD, 400);
    }
    user.password = newPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    return {
      message: "Password updated successfully",
      user,
    };
  },
};
module.exports = userService;
