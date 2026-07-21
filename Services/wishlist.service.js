const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");
const AppError = require("../errors/AppError");
const validateObjectId = require("../utilities/validateObjectId");
const { PRODUCT_ERRORS, WISHLIST_ERRORS } = require("../constants/errors");

const wishlistService = {

    getWishlist: async (userId) => {

        let wishlist = await Wishlist.findOne({
            user: userId
        }).lean();

        if (!wishlist) {

            wishlist = await Wishlist.create({
                user: userId,
                products: []
            });

        }

        return wishlist;

    },

    addToWishlist: async (userId, productId) => {

        validateObjectId(productId);

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            throw new AppError(
                PRODUCT_ERRORS.NOT_FOUND,
                404
            );
        }

        let wishlist = await Wishlist.findOne({
            user: userId
        });

        if (!wishlist) {

            wishlist = await Wishlist.create({
                user: userId,
                products: []
            });

        }

        const exists = wishlist.products.some(
            item => item._id.toString() === productId
        );

        if (exists) {
            throw new AppError(
                WISHLIST_ERRORS.PRODUCT_ALREADY_EXISTS,
                400
            );
        }

        wishlist.products.push(productId);

        await wishlist.save();

        return await Wishlist.findById(wishlist._id);

    },

    removeFromWishlist: async (userId, productId) => {

        validateObjectId(productId);

        const wishlist = await Wishlist.findOne({
            user: userId
        });

        if (!wishlist) {
            throw new AppError(
                WISHLIST_ERRORS.WISHLIST_NOT_FOUND,
                404
            );
        }

        const exists = wishlist.products.some(
            item => item._id.toString() === productId
        );

        if (!exists) {
            throw new AppError(
                WISHLIST_ERRORS.PRODUCT_NOT_FOUND,
                404
            );
        }

        wishlist.products = wishlist.products.filter(
            item => item._id.toString() !== productId
        );

        await wishlist.save();

        return await Wishlist.findById(wishlist._id);

    },

    clearWishlist: async (userId) => {

        const wishlist = await Wishlist.findOne({
            user: userId
        });

        if (!wishlist) {
            throw new AppError(
                WISHLIST_ERRORS.WISHLIST_NOT_FOUND,
                404
            );
        }

        if (wishlist.products.length === 0) {
            throw new AppError(
                WISHLIST_ERRORS.WISHLIST_IS_EMPTY,
                400
            );
        }

        wishlist.products = [];

        await wishlist.save();

      return await Wishlist.findById(wishlist._id);

    }

};

module.exports = wishlistService;