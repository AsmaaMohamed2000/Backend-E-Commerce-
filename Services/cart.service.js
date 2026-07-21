const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const AppError = require("../errors/AppError");
const validateObjectId = require("../utilities/validateObjectId");
const COUPONS = require("../constants/coupons")
const getFinalPrice=require('../utilities/getFinalPrice')
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
    if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(
        CART_ERRORS.INVALID_QUANTITY,
        400
    );
}

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
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
        item => item.product.toString() === productId.toString()
    );

  if (cartItem) {

    const newQuantity = cartItem.quantity + quantity;

    if (newQuantity > product.stock) {
        throw new AppError(
            CART_ERRORS.INSUFFICIENT_STOCK,
            400
        );
    }

    cartItem.quantity = newQuantity
    cartItem.price=getFinalPrice(product)

} 
else {

    if (quantity > product.stock) {
        throw new AppError(
            CART_ERRORS.INSUFFICIENT_STOCK,
            400
        );
    }

    cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url ,
        price: getFinalPrice(product),
        quantity
    });

}



    await cart.save();

    return {cart};

},
updateQuantity: async (userId, productId, quantity) => {

    validateObjectId(productId);
        if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(
        CART_ERRORS.INVALID_QUANTITY,
        400
    );
}

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
        item => item.product.toString() === productId.toString()
    );

    if (!cartItem) {
        throw new AppError(
            CART_ERRORS.PRODUCT_NOT_IN_CART,
            404
        );
    }
   if (product.stock < quantity) {
        throw new AppError(
            CART_ERRORS.INSUFFICIENT_STOCK,
            400
        );
    }
  

    cartItem.quantity = quantity;
     cartItem.price=getFinalPrice(product)

  
await  cart.save()
    return {cart};

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
        item => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
        throw new AppError(
            CART_ERRORS.PRODUCT_NOT_IN_CART,
            404
        );
    }



    cart.items.splice(itemIndex, 1);

    await cart.save();

    return cart;

},
applyCoupon: async (userId, code) => {

    const cart = await Cart.findOne({
        user: userId
    })

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
    if (!code || typeof code !== "string") {
    throw new AppError(
        CART_ERRORS.INVALID_COUPON,
        400
    );
}
const convertedCode=code.toUpperCase()

    const coupon = COUPONS[convertedCode];

    if (!coupon) {
        throw new AppError(
            CART_ERRORS.INVALID_COUPON,
            400
        );
    }

    cart.coupon = {
        code:convertedCode,
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



    cart.items = [];

    cart.coupon = {};

    await cart.save();

    return cart;

},

};

module.exports = cartService;