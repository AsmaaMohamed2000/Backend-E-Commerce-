const express = require("express");
const  dashboardController = require("../controllers/dashbord.controller");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();
router.use(auth.auth, auth.adminOnly('admin'));

// Dashboard Statistics
router.get(
    "/dashboard",
    dashboardController.getDashboardStats
);

// Active Carts
router.get(
    "/carts",
     dashboardController.getAllCarts
);


router.get(
    "/wishlists",
    dashboardController.getAllWishlists
);

// Wishlist Statistics
router.get(
    "/wishlists/stats",
    dashboardController.getWishlistStats
);

module.exports = router;