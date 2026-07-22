


const authService = require("../services/auth.service");

const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body, req.file);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const result = await authService.verifyOtp(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(
        req.body
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: result.success,
        message: result.message,
        accessToken: result.accessToken,
        user: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const result = await authService.refreshToken(
        req.cookies.refreshToken
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const result = await authService.logout(
        req.cookies.refreshToken
      );

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const result = await authService.getMe(req.user._id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  changeRole: async (req, res, next) => {
    try {
      const result = await authService.changeRole(
        req.params.id,
        req.body.role,
        req.user._id
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  
};

module.exports = authController;