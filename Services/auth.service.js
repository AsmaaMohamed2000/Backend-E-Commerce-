const User = require("../models/user.model");
const Otp = require("../models/Otp.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt=require('jsonwebtoken')
const AppError = require("../errors/AppError");

const { AUTH_ERRORS, AUTH_SUCCESS } = require("../constants/auth");

const sendEmail = require("../utilities/sendEmail");

const authService = {
  register: async (data) => {
    const { username, email, password, phone } = data;

  
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(AUTH_ERRORS.USER_ALREADY_EXISTS, 409);
    }

   
    await Otp.deleteMany({
      email,
      type: "verify-email",
    });

   
    const plainOtp = crypto.randomInt(100000, 1000000).toString();

   
    const hashedOtp = await bcrypt.hash(plainOtp, 10);

    // Save OTP
    await Otp.create({
      email,
      code: hashedOtp,
      type: "verify-email",
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
      userData: {
        username,
        email,
        password,
        phone,
      },
    });

    await sendEmail({email, username, otp:plainOtp,type:'otp',subject:"verify your Email"});

    return {
      success: true,
      message: AUTH_SUCCESS.OTP_SENT,
    };
  },
  verifyOtp: async (data) => {
  const { email, code } = data;

  const otp = await Otp.findOne({
    email,
    type: "verify-email",
  }).sort({ createdAt: -1 });

  if (!otp) {
    throw new AppError(AUTH_ERRORS.INVALID_OTP, 400);
  }

  if (otp.expiresAt < Date.now()) {
    await Otp.deleteMany({
      email,
      type: "verify-email",
    });

    throw new AppError(AUTH_ERRORS.INVALID_OTP, 400);
  }

  if (otp.attempts >= 3) {
    throw new AppError(AUTH_ERRORS.OTP_ATTEMPTS_EXCEEDED, 429);
  }

  const validOtp = await bcrypt.compare(code, otp.code);

  if (!validOtp) {
    otp.attempts += 1;

    await otp.save();

    throw new AppError(AUTH_ERRORS.INVALID_OTP, 400);
  }

  const user = await User.create({
    username: otp.userData.username,
    email: otp.userData.email,
    password: otp.userData.password,
    phone: otp.userData.phone,
    isVerified: true,
  });

  await Otp.deleteMany({
    email,
    type: "verify-email",
  });

  return {
    success: true,
    message: AUTH_SUCCESS.EMAIL_VERIFIED,
    data: user,
  };
},
login: async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  if (!user.isVerified) {
    throw new AppError(AUTH_ERRORS.EMAIL_NOT_VERIFIED, 403);
  }

  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = await user.generateRefreshToken();

  return {
    success: true,
    message: AUTH_SUCCESS.LOGIN_SUCCESS,
    accessToken,
    refreshToken,
    data: user,
  };
},
refreshToken: async (token) => {
  if (!token) {
    throw new AppError(AUTH_ERRORS.NO_REFRESH_TOKEN, 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (error) {
    throw new AppError(AUTH_ERRORS.INVALID_REFRESH_TOKEN, 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, 404);
  }

  let matchedToken = null;

  for (const item of user.tokens) {
    const isMatch = await bcrypt.compare(token, item.token);

    if (isMatch) {
      matchedToken = item;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError(AUTH_ERRORS.INVALID_REFRESH_TOKEN, 401);
  }

  user.tokens = user.tokens.filter(
    (item) => item._id.toString() !== matchedToken._id.toString()
  );

  await user.save();

  const accessToken = user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  return {
    success: true,
    accessToken,
    refreshToken,
    data: user,
  }
},
logout: async (token) => {
  if (!token) {
    throw new AppError(AUTH_ERRORS.NO_REFRESH_TOKEN, 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (error) {
    throw new AppError(AUTH_ERRORS.INVALID_REFRESH_TOKEN, 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, 404);
  }

  let matchedToken = null;

  for (const item of user.tokens) {
    const isMatch = await bcrypt.compare(token, item.token);

    if (isMatch) {
      matchedToken = item;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError(AUTH_ERRORS.INVALID_REFRESH_TOKEN, 401);
  }

  user.tokens = user.tokens.filter(
    (item) => item._id.toString() !== matchedToken._id.toString()
  );

  await user.save();

  return {
    success: true,
    message: AUTH_SUCCESS.LOGOUT_SUCCESS,
  };
},
forgotPassword: async (data) => {
  const { email } = data;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    email: user.email,
   resetUrl:resetLink,
   subject:'Reset Password',
   type:'reset-password'
   });

  return {
    success: true,
    message: AUTH_SUCCESS.PASSWORD_RESET_LINK_SENT,resetToken
  };
},

 
resetPassword: async (data) => {
  const {token, newPassword } = data;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new AppError(AUTH_ERRORS.INVALID_RESET_TOKEN, 400);
  }

  const isSamePassword = await user.comparePassword(newPassword);

  if (isSamePassword) {
    throw new AppError(AUTH_ERRORS.SAME_PASSWORD, 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return {
    success: true,
    message: AUTH_SUCCESS.PASSWORD_RESET_SUCCESS,
  };
},
changeRole: async (userId, role, currentUserId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, 404);
  }

  if (user._id.toString() === currentUserId.toString()) {
    throw new AppError(AUTH_ERRORS.USER_CANNOT_CHANGE_OWN_ROLE, 400);
  }

  user.role = role;

  await user.save();

  return {
    success: true,
    message: AUTH_SUCCESS.ROLE_UPDATED,
    data: user,
  };
},
getMe: async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, 404);
  }

  return {
    success: true,
    data: user,
  };
},
}
module.exports = authService


