const dashboardService = require("../services/admin.service");

const dashboardController = {

    getDashboardStats: async (req, res, next) => {
        try {

            const stats = await dashboardService.getDashboardStats();

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            next(error);
        }
    },

    getAllCarts: async (req, res, next) => {
        try {

            const carts = await dashboardService.getAllCarts(req.query);

            res.status(200).json({
                carts
            });

        } catch (error) {
            next(error);
        }
    },

    getAllWishlists: async (req, res, next) => {
        try {

            const wishlists = await dashboardService.getAllWishlists(req.query);

            res.status(200).json({
               wishlists
            });

        } catch (error) {
            next(error);
        }
    },

    getWishlistStats: async (req, res, next) => {
        try {

            const stats = await dashboardService.getWishlistStats();

            res.status(200).json({
                stats
            });

        } catch (error) {
            next(error);
        }
    }

};

module.exports = dashboardController;