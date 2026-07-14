const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/authMiddleware");
const validate = require("../validators/order.validate");

const express = require("express");
const router = express.Router();

// User
router.post(
    "/",
    auth.auth,
    auth.validate(validate.createOrderSchema),
    orderController.createOrder
);

router.get(
    "/my",
    auth.auth,
    orderController.getMyOrders
);

router.get(
    "/my/:id",
    auth.auth,
    orderController.getOrder
);

router.patch(
    "/my/:id/cancel",
    auth.auth,
    orderController.cancelOrder
);

// Admin
router.get(
    "/admin",
    auth.auth,
    auth.adminOnly("admin"),
    orderController.getAllOrders
);

router.get(
    "/admin/:id",
    auth.auth,
    auth.adminOnly("admin"),
    orderController.getAdminOrder
);

router.patch(
    "/admin/:id/status",
    auth.auth,
    auth.adminOnly("admin"),
    auth.validate(validate.updateOrderStatusSchema),
    orderController.updateOrderStatus
);

module.exports = router;