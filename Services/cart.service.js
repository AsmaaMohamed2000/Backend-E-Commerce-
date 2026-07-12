const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const AppError = require("../errors/AppError");
const validateObjectId = require("../utilities/validateObjectId");
const COUPONS = require("../constants/coupons")
const { CART_ERRORS, PRODUCT_ERRORS } = require("../constants/errors");
const cartService = {
  getCart: async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    return cart;
  },
  addItem: async (userId, productId, quantity = 1) => {

    validateObjectId(productId);

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    // if (!product.isActive) {
    //     throw new AppError(
    //         PRODUCT_ERRORS.NOT_FOUND,
    //         404
    //     );
    // }

    if (product.stock < quantity) {
        throw new AppError(
            CART_ERRORS.INSUFFICIENT_STOCK,
            400
        );
    }

    let cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {

        cart = await Cart.create({
            user: userId,
            items: []
        });

    }

    const cartItem = cart.items.find(
        item => item.product.toString() === productId
    );

    if (cartItem) {

        if (
            product.stock <
            quantity 
        ) {
            throw new AppError(
                CART_ERRORS.INSUFFICIENT_STOCK,
                400
            );
        }

        cartItem.quantity += quantity;

    } else {

        cart.items.push({

            product: product._id,

            name: product.name,

            image: product.images[0]?.url,

            price:
                product.discountPrice > 0
                    ? product.discountPrice
                    : product.price,

            quantity

        });

    }

    product.stock -= quantity;

    await product.save();

    await cart.save();

    return {cart,product};

},
updateQuantity: async (userId, productId, quantity) => {

    validateObjectId(productId);

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    const cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {
        throw new AppError(
            CART_ERRORS.CART_NOT_FOUND,
            404
        );
    }

    const cartItem = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!cartItem) {
        throw new AppError(
            CART_ERRORS.PRODUCT_NOT_IN_CART,
            404
        );
    }

    const difference = quantity - cartItem.quantity;

    if (difference > 0) {

        if (product.stock < difference) {
            throw new AppError(
                CART_ERRORS.QUANTITY_EXCEEDS_STOCK,
                400
            );
        }

        product.stock -= difference;

    } else if (difference < 0) {

        product.stock += Math.abs(difference);

    }

    cartItem.quantity = quantity;

    await Promise.all([
        product.save(),
        cart.save()
    ]);

    return {cart,product};

},
removeItem: async (userId, productId) => {

    validateObjectId(productId);

    const cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {
        throw new AppError(
            CART_ERRORS.CART_NOT_FOUND,
            404
        );
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new AppError(
            CART_ERRORS.PRODUCT_NOT_IN_CART,
            404
        );
    }

    const cartItem = cart.items[itemIndex];

    const product =await Product.findByIdAndUpdate(
        productId,
        {
            $inc: {
                stock: cartItem.quantity
            }
        }
    );

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return cart;

},
applyCoupon: async (userId, code) => {

    const cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {
        throw new AppError(
            CART_ERRORS.CART_NOT_FOUND,
            404
        );
    }

    if (cart.items.length === 0) {
        throw new AppError(
            CART_ERRORS.CART_IS_EMPTY,
            400
        );
    }

    if (cart.coupon?.code) {
        throw new AppError(
            CART_ERRORS.COUPON_ALREADY_APPLIED,
            400
        );
    }

    const coupon = COUPONS[code];

    if (!coupon) {
        throw new AppError(
            CART_ERRORS.INVALID_COUPON,
            400
        );
    }

    cart.coupon = {
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
    };

    await cart.save();

    return cart;

},
removeCoupon: async (userId) => {

    const cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {
        throw new AppError(
            CART_ERRORS.CART_NOT_FOUND,
            404
        );
    }

    if (!cart.coupon?.code) {
        throw new AppError(
            CART_ERRORS.NO_COUPON_APPLIED,
            400
        );
    }

    cart.coupon = {};

    await cart.save();

    return cart;

},
clearCart: async (userId) => {

    const cart = await Cart.findOne({
        user: userId
    });

    if (!cart) {
        throw new AppError(
            CART_ERRORS.CART_NOT_FOUND,
            404
        );
    }

    if (cart.items.length === 0) {
        throw new AppError(
            CART_ERRORS.CART_IS_EMPTY,
            400
        );
    }

  await Promise.all(
    cart.items.map(item =>
        Product.findByIdAndUpdate(
            item.product,
            {
                $inc: {
                    stock: item.quantity
                }
            }
        )
    )
);

    cart.items = [];

    cart.coupon = {};

    await cart.save();

    return cart;

},

};

module.exports = cartService;