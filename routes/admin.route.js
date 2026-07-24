const express = require("express");
const  dashboardController = require("../controllers/dashbord.controller");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();
router.use(auth.auth, auth.adminOnly('admin'));

router.get(
    "/dashboard",
    dashboardController.getDashboardStats
);

router.get(
    "/carts",
     dashboardController.getAllCarts
);


router.get(
    "/wishlists",
    dashboardController.getAllWishlists
);

router.get(
    "/wishlists/stats",
    dashboardController.getWishlistStats
);

module.exports = router;