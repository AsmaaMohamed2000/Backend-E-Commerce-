const wishlistService = require("../services/wishlist.service");

const wishlistController = {

    getWishlist: async (req, res, next) => {
        try {

            const wishlist = await wishlistService.getWishlist(req.user._id);

            res.status(200).json({
                success: true,
                data: wishlist
            });

        } catch (error) {
            next(error);
        }
    },

    addToWishlist: async (req, res, next) => {
        try {

            const wishlist = await wishlistService.addToWishlist(
                req.user._id,
                req.params.productId
            );

            res.status(200).json({
                success: true,
                message: "Product added to wishlist successfully",
                data: wishlist
            });

        } catch (error) {
            next(error);
        }
    },

    removeFromWishlist: async (req, res, next) => {
        try {

            const wishlist = await wishlistService.removeFromWishlist(
                req.user._id,
                req.params.productId
            );

            res.status(200).json({
                success: true,
                message: "Product removed from wishlist successfully",
                data: wishlist
            });

        } catch (error) {
            next(error);
        }
    },

    clearWishlist: async (req, res, next) => {
        try {

            const wishlist = await wishlistService.clearWishlist(req.user._id);

            res.status(200).json({
                success: true,
                message: "Wishlist cleared successfully",
                data: wishlist
            });

        } catch (error) {
            next(error);
        }
    }

};

module.exports = wishlistController;