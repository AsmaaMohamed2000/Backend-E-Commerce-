const orderService = require("../services/order.service");

const orderController = {

    createOrder: async (req, res, next) => {
        try {

            const order = await orderService.createOrder(req.user._id, req.body);

            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: order
            });

        } catch (error) {
            next(error);
        }
    },

    getMyOrders: async (req, res, next) => {
        try {

            const orders = await orderService.getMyOrders(req.user._id, req.query);

            res.status(200).json({
                success: true,
                data: orders
            });

        } catch (error) {
            next(error);
        }
    },

    getOrder: async (req, res, next) => {
        try {

            const order = await orderService.getOrder(req.user._id, req.params.id);

            res.status(200).json({
                success: true,
                data: order
            });

        } catch (error) {
            next(error);
        }
    },

    cancelOrder: async (req, res, next) => {
        try {

            const order = await orderService.cancelOrder(req.user._id, req.params.id);

            res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                data: order
            });

        } catch (error) {
            next(error);
        }
    },

    getAllOrders: async (req, res, next) => {
        try {

            const orders = await orderService.getAllOrders(req.query);

            res.status(200).json({
                success: true,
                data: orders
            });

        } catch (error) {
            next(error);
        }
    },

    getAdminOrder: async (req, res, next) => {
        try {

            const order = await orderService.getAdminOrder(req.params.id);

            res.status(200).json({
                success: true,
                data: order
            });

        } catch (error) {
            next(error);
        }
    },

    updateOrderStatus: async (req, res, next) => {
        try {

            const order = await orderService.updateOrderStatus(
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Order status updated successfully",
                data: order
            });

        } catch (error) {
            next(error);
        }
    },
   stripeWebhook: async (req, res, next) => {

    try {

        await orderService.stripeWebhook(req);

        res.status(200).json({
            received: true
        });

    } catch (error) {

        next(error);

    }

}

};

module.exports = orderController;