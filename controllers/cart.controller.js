const cartService = require("../services/cart.service");

const cartController = {

    getCart: async (req, res, next) => {
        try {

            const cart = await cartService.getCart(req.user.id);

            res.status(200).json({
                success: true,
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    addItem: async (req, res, next) => {
        try {
const {productId,quantity}=req.body
            const cart = await cartService.addItem(req.user._id,productId,quantity);

            res.status(200).json({
                success: true,
                message: "Item added to cart successfully",
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    updateItem: async (req, res, next) => {
        try {
const {productId,quantity}=req.body
            const cart = await cartService.updateQuantity(req.user._id,productId,quantity);

            res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    removeItem: async (req, res, next) => {
        try {

            const cart = await cartService.removeItem(req.user._id,req.params.id);

            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    applyCoupon: async (req, res, next) => {
        try {
const {code}=req.body
            const cart = await cartService.applyCoupon(req.user._id,code);

            res.status(200).json({
                success: true,
                message: "Coupon applied successfully",
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    removeCoupon: async (req, res, next) => {
        try {

            const cart = await cartService.removeCoupon(req.user._id);

            res.status(200).json({
                success: true,
                message: "Coupon removed successfully",
                data: cart
            });

        } catch (error) {
            next(error);
        }
    },

    clearCart: async (req, res, next) => {
        try {

            const result = await cartService.clearCart(req.user._id);

            res.status(200).json({
                success: true,
                result
            });

        } catch (error) {
            next(error);
        }
    }

};

module.exports = cartController;