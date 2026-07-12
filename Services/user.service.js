const User = require('../models/user.model')
const uploade=require('../middlewares/uploads')
const cloudinary=require('../config/cloudinary')
const crypto = require("crypto");
const AppError = require("../errors/AppError");
const uploadCloudinary=require('../utilities/cloudinary')
const {USER_ERRORS,USER_SUCCESS}=require('../constants/errors')
const sendEmail = require("../utilities/sendEmail");
const bcrypt=require('bcryptjs')
const userService={
addUser: async (data) => {
  const {
    username,
    email,
    password,
    phone,
    role,
    addresses,
  } = data;

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
    addresses,
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

 const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken};`
   try {
  await sendEmail({
    email: user.email,
    subject: "Set Your Password",
    resetUrl,
    type: "set-password",
  });
} catch (error) {
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save({ validateBeforeSave: false });

  throw new AppError("Failed to send email", 500);
}

  return {
    success: true,
    message: USER_SUCCESS.USER_CREATED,
    data: user,
  };
},
getAllUsers: async ({
  page = 1,
  limit = 10,
  search,
  sort = "-createdAt",
  role,
  isVerified,
}) => {
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
    filter.isVerified = isVerified === "true";
  }

  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith("-") ? -1 : 1;

  const totalUsers = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select("-password -tokens -resetPasswordToken -resetPasswordExpire -__v")
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return {
    success: true,
    page: Number(page),
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers,
    countReturned: users.length,
    data: users,
  };
},

getUserById: async (id) => {
  const user = await User.findById(id)
    .select("-password -tokens -resetPasswordToken -resetPasswordExpire -__v");

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  return {
    success: true,
    data: user,
  };
},
deleteUser: async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  // Delete avatar from Cloudinary
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
  const user = await User.findById(id);
  console.log(file)

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  const isAdmin = currentUser.role === "admin";
  const isOwner = currentUser.id.toString() === user._id.toString();

  if (!isAdmin && !isOwner) {
    throw new AppError(USER_ERRORS.UNAUTHORIZED, 403);
  }

 
  const updates = {};

  if (data.username !== undefined) {
    updates.username = data.username;
  }

  if (data.phone !== undefined) {
    updates.phone = data.phone;
  }

  if (isAdmin) {
    if (data.role !== undefined) {
       throw new AppError(
        USER_ERRORS.ROLE_ROUTE,
        400
      );
    }

    if (data.isVerified !== undefined) {
      updates.isVerified = data.isVerified;
    }
  }

  if (data.addresses !== undefined) {
    if (!Array.isArray(data.addresses)) {
      throw new AppError(
        USER_ERRORS.INVALID_ADDRESSES,
        400
      );
    }

    const defaultAddresses = data.addresses.filter(
      (address) => address.isDefault
    );

    if (defaultAddresses.length > 1) {
      throw new AppError(
        USER_ERRORS.MULTIPLE_DEFAULT_ADDRESSES,
        400
      );
    }

    updates.addresses = data.addresses;
  }

  if (file) {
    const image = await uploadCloudinary(file.buffer, "users");

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    updates.avatar = {
      url: image.secure_url,
      publicId: image.public_id,
    };
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      USER_ERRORS.NO_UPDATE_DATA,
      400
    );
  }

  Object.assign(user, updates);

  await user.save();

  return {
    success: true,
    message: USER_SUCCESS.USER_UPDATED,
    data: user,
  };
},
changePassword: async (id,data) => {

    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }
const samePassword = await user.comparePassword(
    newPassword
);

if (samePassword) {
    throw new Error(
        "New password must be different from current password"
    );
}
    user.password = newPassword;

    await user.save();

    return {
        message: "Password updated successfully",
        user
    };
}

}
module.exports=userService
