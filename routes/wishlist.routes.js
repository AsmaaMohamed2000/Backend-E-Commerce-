const express = require("express");
const wishlistController = require("../controllers/wishlist.controller");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/my",
    auth.auth,
    wishlistController.getWishlist
);

router.post(
    "/add/:productId",
     auth.auth,
    wishlistController.addToWishlist
);

router.delete(
    "/remove/:productId",
   auth.auth,
    wishlistController.removeFromWishlist
);

router.delete(
    "/clear",
    auth.auth,
    wishlistController.clearWishlist
);

module.exports = router;