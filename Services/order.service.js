const { ORDER_ERRORS}=require('../constants/errors')
const calculateOrderTotals=require('../utilities/calcOrderTotal')
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const AppError = require("../errors/AppError");
const stripe=require('../config/stripe')
const validateObjectId = require("../utilities/validateObjectId");
const {filter,sortedOrder}=require('../utilities/orderFilterAndSort')
const allowedTransitions=require('../constants/order')
const mongoose=require('mongoose')
module.exports={
createOrder: async (userId, orderData) => {

    const { paymentMethod } = orderData;

    if (paymentMethod === "cash") {
        return await createCashOrder(userId, orderData);
    }

    if (paymentMethod === "stripe") {
        return await createStripeOrder(userId, orderData);
    }

    throw new AppError(
        ORDER_ERRORS.INVALID_PAYMENT_METHOD,
        400
    );

},
getMyOrders: async (query,userId) => {

    const {
        page = 1,
        limit = 10,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

   const filtered=filter(userId,query)
   const sortedData=sortedOrder(query)

    const orders = await Order.find(filtered)
        .sort(sortedData)
        .skip(skip)
        .limit(Number(limit));

    const totalOrders = await Order.countDocuments(filtered);

    return {
        orders,
        pagination: {
            totalOrders,
            currentPage: Number(page),
            totalPages: Math.ceil(totalOrders / Number(limit)),
            limit: Number(limit)
        }
    };

},
getOrder: async (userId, orderId) => {

    validateObjectId(orderId);

    const order = await Order.findOne({
        _id: orderId,
        user: userId
    });

    if (!order) {
        throw new AppError(
            ORDER_ERRORS.ORDER_NOT_FOUND,
            404
        );
    }

    return order;

},
cancelOrder: async (userId, orderId) => {

    validateObjectId(orderId);

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        }).session(session);

        if (!order) {
            throw new AppError(
                ORDER_ERRORS.ORDER_NOT_FOUND,
                404
            );
        }

        if (order.status === "cancelled") {
            throw new AppError(
                ORDER_ERRORS.ORDER_ALREADY_CANCELLED,
                400
            );
        }

        if (["shipped", "delivered", "returned"].includes(order.status)) {
            throw new AppError(
                ORDER_ERRORS.ORDER_CANNOT_BE_CANCELLED,
                400
            );
        }

        await Promise.all(

            order.items.map(item =>
                Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: item.quantity
                        }
                    },
                    {
                        session
                    }
                )
            )

        );

        order.status = "cancelled";
        order.cancelledAt = new Date();

        await order.save({ session });

        await session.commitTransaction();

        return order;

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }

},
getAllOrders: async (query) => {

    const {
        page = 1,
        limit = 10
    } = query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filtered=filter(query)
   const sortedData=sortedOrder(query)

    const orders = await Order.find(filtered)
        .populate("user", "username email")
        .sort(sortedData)
        .skip(skip)
        .limit(pageSize)
        .lean();

    const totalOrders = await Order.countDocuments(filtered);

    return {
        orders,
        pagination: {
            totalOrders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / pageSize),
            limit: pageSize
        }
    };

},
updateOrderStatus: async (orderId, orderData) => {

    validateObjectId(orderId);

    const { status, adminNote } = orderData;

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new AppError(
                ORDER_ERRORS.ORDER_NOT_FOUND,
                404
            );
        }

        if (order.status === "cancelled") {
            throw new AppError(
                ORDER_ERRORS.ORDER_ALREADY_CANCELLED,
                400
            );
        }

        if (order.status === "delivered") {
            throw new AppError(
                ORDER_ERRORS.ORDER_ALREADY_DELIVERED,
                400
            );
        }

        if (!allowedTransitions[order.status].includes(status)) {
            throw new AppError(
                ORDER_ERRORS.INVALID_ORDER_STATUS,
                400
            );
        }

        if (status === "cancelled") {

            await Promise.all(
                order.items.map(item =>
                    Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: {
                                stock: item.quantity
                            }
                        },
                        { session }
                    )
                )
            );

            order.cancelledAt = new Date();

        }

        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        order.status = status;

        if (adminNote) {
            order.adminNote = adminNote;
        }

        await order.save({ session });

        await session.commitTransaction();

        return order;

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }

},
getAdminOrder: async (orderId) => {

    validateObjectId(orderId);

    const order = await Order.findById(orderId)
        .populate("user", "username email phone");

    if (!order) {
        throw new AppError(
            ORDER_ERRORS.ORDER_NOT_FOUND,
            404
        );
    }

    return order;

},
stripeWebhook: async (req) => {

    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(

        req.body,

        signature,

        process.env.STRIPE_WEBHOOK_SECRET

    );

    if (event.type !== "payment_intent.succeeded") {

        return;

    }

    const paymentIntent = event.data.object;

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const order = await Order.findById(

            paymentIntent.metadata.orderId

        ).session(session);

        if (!order) {

            throw new AppError(

                ORDER_ERRORS.ORDER_NOT_FOUND,

                404

            );

        }

        if (order.paymentStatus === "paid") {

            await session.commitTransaction();

            return;

        }

        order.paymentStatus = "paid";

        order.status = "confirmed";

        order.paidAt = new Date();

        order.transactionId = paymentIntent.id;

        await order.save({ session });

        const cart = await Cart.findOne({

            user: order.user

        }).session(session);

        if (cart) {

            cart.items = [];

            cart.coupon = {};

            await cart.save({ session });

        }

        await session.commitTransaction();

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }

}
}

  



createCashOrder= async (userId, orderData) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const {
            shippingAddress,
           
            customerNote
        } = orderData;

        const cart = await Cart.findOne({
            user: userId
        }).session(session);

        if (!cart) {
            throw new AppError(
                ORDER_ERRORS.CART_NOT_FOUND,
                404
            );
        }

        if (cart.items.length === 0) {
            throw new AppError(
                ORDER_ERRORS.CART_IS_EMPTY,
                400
            );
        }

      const products = await Promise.all(
    cart.items.map(item =>
        Product.findOne({
            _id: item.product,
            isActive: true
        }).session(session)
    )
);

if (products.some(product => !product)) {
    throw new AppError(
        ORDER_ERRORS.PRODUCT_NOT_AVAILABLE,
        404
    );
}
        const {
            subtotal,
            shippingFee,
            tax,
            discount,
            totalPrice
        } = calculateOrderTotals(cart);

        const items = cart.items.map(item => ({

            product: item.product,

            name: item.name,

            image: item.image,

            price: item.price,

            quantity: item.quantity

        }));

        const [order] = await Order.create(
            [
                {
                    user: userId,

                    items,

                    shippingAddress,

                    paymentMethod:'cash',

                    subtotal,

                    shippingFee,

                    tax,

                    discount,

                    totalPrice,

                    customerNote
                }
            ],
            { session }
        );

        cart.items = [];
        cart.coupon = {};

        await cart.save({ session });

        await session.commitTransaction();

        return order;

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }

    }

// const createStripeOrder = async (userId, orderData) => {

//     const {
//         shippingAddress,
//         customerNote
//     } = orderData;

//     const cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//         throw new AppError(
//             ORDER_ERRORS.CART_NOT_FOUND,
//             404
//         );
//     }

//     if (cart.items.length === 0) {
//         throw new AppError(
//             ORDER_ERRORS.CART_IS_EMPTY,
//             400
//         );
//     }

//     const {
//         subtotal,
//         shippingFee,
//         tax,
//         discount,
//         totalPrice
//     } = calculateOrderTotals(cart);

//     const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(totalPrice * 100),
//         currency: "egp",
//         metadata: {
//             userId: userId.toString(),
//             shippingAddress: JSON.stringify(shippingAddress),
//             customerNote: customerNote || ""
//         }
//     });

//     return {
//         clientSecret: paymentIntent.client_secret,
//         paymentIntentId: paymentIntent.id
//     };
// };
const createStripeOrder = async (userId, orderData) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const {
            shippingAddress,
            customerNote
        } = orderData;

        const cart = await Cart.findOne({
            user: userId
        }).session(session);

        if (!cart) {
            throw new AppError(
                ORDER_ERRORS.CART_NOT_FOUND,
                404
            );
        }

        if (cart.items.length === 0) {
            throw new AppError(
                ORDER_ERRORS.CART_IS_EMPTY,
                400
            );
        }

        const products = await Promise.all(
            cart.items.map(item =>
                Product.findOne({
                    _id: item.product,
                    isActive: true
                }).session(session)
            )
        );

        if (products.some(product => !product)) {
            throw new AppError(
                ORDER_ERRORS.PRODUCT_NOT_AVAILABLE,
                404
            );
        }

        const {
            subtotal,
            shippingFee,
            tax,
            discount,
            totalPrice
        } = calculateOrderTotals(cart);

        const items = cart.items.map(item => ({

            product: item.product,

            name: item.name,

            image: item.image,

            price: item.price,

            quantity: item.quantity

        }));

        const [order] = await Order.create(
            [{
                user: userId,

                items,

                shippingAddress,

                paymentMethod: "stripe",

                paymentStatus: "pending",

                status: "pending",

                subtotal,

                shippingFee,

                tax,

                discount,

                totalPrice,

                customerNote
            }],
            { session }
        );

        const paymentIntent = await stripe.paymentIntents.create({

            amount: Math.round(totalPrice * 100),

            currency: "egp",

            metadata: {

                orderId: order._id.toString()

            }

        });

        order.transactionId = paymentIntent.id;

        await order.save({ session });

        await session.commitTransaction();

        return {

            orderId: order._id,

            clientSecret: paymentIntent.client_secret

        };

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

    }

};