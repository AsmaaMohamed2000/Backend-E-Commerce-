const userService = require("../services/user.service");

const userController = {
  addUser: async (req, res, next) => {
    try {
      const result = await userService.addUser(req.body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const result = await userService.getAllUsers({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search || "",
        sort: req.query.sort || "-createdAt",
        role: req.query.role,
        isVerified: req.query.isVerified,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const result = await userService.getUserById(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const result = await userService.getMe(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const result = await userService.updateUser(
        req.params.id,
        req.user,
        req.body,
        req.file
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const result = await userService.changePassword(
        req.user.id,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const result = await userService.deleteUser(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;