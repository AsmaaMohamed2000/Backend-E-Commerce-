const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/authMiddleware");
const validate = require("../validators/cart.validate");

const express = require("express");
const router = express.Router();

router.get(
    "/",
    auth.auth,
    cartController.getCart
);

router.post(
    "/items",
    auth.auth,
    auth.validate(validate.addItemSchema),
    cartController.addItem
);

router.patch(
    "/items",
    auth.auth,
    auth.validate(validate.updateQuantitySchema),
    cartController.updateItem
);

router.delete(
    "/items/:id",
    auth.auth,
    cartController.removeItem
);

router.post(
    "/coupon",
    auth.auth,
    auth.validate(validate.applyCouponSchema),
    cartController.applyCoupon
);

router.delete(
    "/coupon",
    auth.auth,
    cartController.removeCoupon
);

router.delete(
    "/clear",
    auth.auth,
    cartController.clearCart
);

module.exports = router;