const {
  ORDER_ERRORS,
  CART_ERRORS,
  PRODUCT_ERRORS,
} = require("../constants/errors");
const calculateOrderTotals = require("../utilities/calcOrderTotal");
const Cart = require("../models/cart.model");
const User = require("../models/User.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const AppError = require("../errors/AppError");
const stripe = require("../config/stripe");
const sendEmail = require("../utilities/sendEmail");
const validateObjectId = require("../utilities/validateObjectId");
const { filter, sortedOrder } = require("../utilities/orderFilterAndSort");
const allowedTransitions = require("../constants/order");
const mongoose = require("mongoose");

const createCashOrder = async (userId, orderData) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const {
      shippingAddress,

      customerNote,
    } = orderData;

    const cart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!cart) {
      throw new AppError(ORDER_ERRORS.CART_NOT_FOUND, 404);
    }

    if (cart.items.length === 0) {
      throw new AppError(ORDER_ERRORS.CART_IS_EMPTY, 400);
    }

    const items = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) {
        throw new AppError(ORDER_ERRORS.PRODUCT_NOT_AVAILABLE, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(
          ` ${product.name} ${CART_ERRORS.INSUFFICIENT_STOCK}`,
          400,
        );
      }
      product.stock -= item.quantity;
      await product.save({ session });
      items.push({
        product: item.product,

        name: item.name,

        image: item.image,

        price: item.price,

        quantity: item.quantity,
      });
    }

    const { subtotal, shippingFee, tax, discount, totalPrice } =
      calculateOrderTotals(cart);

    const [order] = await Order.create(
      [
        {
          user: userId,

          items,

          shippingAddress,

          paymentMethod: "cash",

          subtotal,

          shippingFee,

          tax,

          discount,

          totalPrice,

          customerNote,
        },
      ],
      { session },
    );

    cart.items = [];
    cart.coupon = {};

    await cart.save({ session });

    await session.commitTransaction();
    const user = await User.findById(userId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject: "Order Confirmation",
        type: "order-confirmation",
        username: user.username,
        orderId: order._id,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        tax: order.tax,
        discount: order.discount,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      });
    }

    return order;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};


const createStripeOrder = async (userId, orderData) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const { shippingAddress, customerNote } = orderData;

    const cart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!cart) {
      throw new AppError(ORDER_ERRORS.CART_NOT_FOUND, 404);
    }
    if (cart.items.length === 0) {
      throw new AppError(ORDER_ERRORS.CART_IS_EMPTY, 400);
    }
    const items = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) {
        throw new AppError(ORDER_ERRORS.PRODUCT_NOT_AVAILABLE, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(CART_ERRORS.INSUFFICIENT_STOCK, 400);
      }

      items.push({
        product: item.product,

        name: item.name,

        image: item.image,

        price: item.price,

        quantity: item.quantity,
      });
    }

    const { subtotal, shippingFee, tax, discount, totalPrice } =
      calculateOrderTotals(cart);

 

    const [order] = await Order.create(
      [
        {
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

          customerNote,
        },
      ],
      { session },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),

      currency: "egp",

      metadata: {
        orderId: order._id.toString(),
      },
    });

    order.transactionId = paymentIntent.id;

    await order.save({ session });

    await session.commitTransaction();

    return {
      orderId: order._id,

      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};
module.exports = {
  createOrder: async (userId, orderData) => {
    const { paymentMethod } = orderData;

    if (paymentMethod === "cash") {
      return await createCashOrder(userId, orderData);
    }

    if (paymentMethod === "stripe") {
      return await createStripeOrder(userId, orderData);
    }

    throw new AppError(ORDER_ERRORS.INVALID_PAYMENT_METHOD, 400);
  },
  getMyOrders: async (userId, query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filtered = filter(query);
    filtered.user = userId;
    const sortedData = sortedOrder(query);

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
        limit: Number(limit),
      },
    };
  },
  getOrder: async (userId, orderId) => {
    validateObjectId(orderId);

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      throw new AppError(ORDER_ERRORS.ORDER_NOT_FOUND, 404);
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
        user: userId,
      }).session(session);

      if (!order) {
        throw new AppError(ORDER_ERRORS.ORDER_NOT_FOUND, 404);
      }

      if (order.status === "cancelled") {
        throw new AppError(ORDER_ERRORS.ORDER_ALREADY_CANCELLED, 400);
      }

      if (["shipped", "delivered", "returned"].includes(order.status)) {
        throw new AppError(ORDER_ERRORS.ORDER_CANNOT_BE_CANCELLED, 400);
      }

      const shouldRestoreStock =
        order.paymentMethod === "cash" || order.paymentStatus === "paid";

      if (shouldRestoreStock) {
        await Promise.all(
          order.items.map((item) =>
            Product.findByIdAndUpdate(
              item.product,
              {
                $inc: {
                  stock: item.quantity,
                },
              },
              { session },
            ),
          ),
        );
      }

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
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filtered = filter(query);
    const sortedData = sortedOrder(query);

    const orders = await Order.find(filtered)
      .populate("user", "username email")
      .sort(sortedData)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments(filtered);

    return {
      orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
      },
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
        throw new AppError(ORDER_ERRORS.ORDER_NOT_FOUND, 404);
      }

      if (order.status === "cancelled") {
        throw new AppError(ORDER_ERRORS.ORDER_ALREADY_CANCELLED, 400);
      }

      if (order.status === "delivered") {
        throw new AppError(ORDER_ERRORS.ORDER_ALREADY_DELIVERED, 400);
      }

      if (
        !allowedTransitions[order.status] ||
        !allowedTransitions[order.status].includes(status)
      ) {
        throw new AppError(ORDER_ERRORS.INVALID_ORDER_STATUS, 400);
      }

      if (status === "cancelled") {
        const shouldRestoreStock =
          order.paymentMethod === "cash" || order.paymentStatus === "paid";

        if (shouldRestoreStock) {
          await Promise.all(
            order.items.map((item) =>
              Product.findByIdAndUpdate(
                item.product,
                {
                  $inc: {
                    stock: item.quantity,
                  },
                },
                { session },
              ),
            ),
          );
        }

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

      const user = await User.findById(order.user);

      try {
        await sendEmail({
          email: user.email,
          subject: "Order Status Updated",
          type: "order-status",
          username: user.username,
          orderId: order._id,
          status: order.status,
          adminNote: order.adminNote,
        });
      } catch (err) {
        console.log(err);
      }

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

    const order = await Order.findById(orderId).populate(
      "user",
      "username email phone",
    );

    if (!order) {
      throw new AppError(ORDER_ERRORS.ORDER_NOT_FOUND, 404);
    }

    return order;
  },
  stripeWebhook: async (req) => {
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,

      signature,

      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const order = await Order.findById(
          paymentIntent.metadata.orderId,
        ).session(session);

        if (!order) {
          await session.commitTransaction();
          return;
        }

        if (order.paymentStatus === "paid" || order.status === "cancelled") {
          await session.commitTransaction();
          return;
        }

        order.status = "cancelled";
        order.paymentStatus = "failed";
        order.cancelledAt = new Date();

        await order.save({ session });

        await session.commitTransaction();

        return order;
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const session = await mongoose.startSession();

      session.startTransaction();

      try {
        const order = await Order.findById(
          paymentIntent.metadata.orderId,
        ).session(session);

        if (!order) {
          await session.commitTransaction();
          return;
        }

        if (order.paymentStatus === "paid") {
          await session.commitTransaction();

          return;
        }
        await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findById(item.product).session(
              session,
            );

            if (!product) {
              throw new AppError(PRODUCT_ERRORS.NOT_FOUND, 404);
            }

            if (product.stock < item.quantity) {
              throw new AppError(PRODUCT_ERRORS.INSUFFICIENT_STOCK, 400);
            }

            product.stock -= item.quantity;

            await product.save({ session });
          }),
        );
        const cart = await Cart.findOne({ user: order.user }).session(session);

        if (cart) {
          cart.items = [];

          cart.coupon = {};

          await cart.save({ session });
        }

        order.paymentStatus = "paid";

        order.status = "confirmed";

        order.paidAt = new Date();

        order.transactionId = paymentIntent.id;

        await order.save({ session });

        await session.commitTransaction();
        const user = await User.findById(order.user);
        if (user) {
          await sendEmail({
            email: user.email,
            subject: "Order Confirmation",
            type: "order-confirmation",
            username: user.username,
            orderId: order._id,
            items: order.items,
            subtotal: order.subtotal,
            shippingFee: order.shippingFee,
            tax: order.tax,
            discount: order.discount,
            totalPrice: order.totalPrice,
            paymentMethod: order.paymentMethod,
          });
        }

        return order;
      } catch (error) {
        await session.abortTransaction();

        throw error;
      } finally {
        await session.endSession();
      }
    }
  },
};




