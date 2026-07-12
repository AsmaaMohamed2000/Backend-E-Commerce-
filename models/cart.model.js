const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],

    coupon: {
      code: {
        type: String,
        uppercase: true,
        trim: true,
      },

      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },

      discountValue: {
        type: Number,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

cartSchema.virtual("discountAmount").get(function () {
  const subtotal = this.subtotal;

  if (!this.coupon || !this.coupon.code) return 0;

  if (this.coupon.discountType === "percentage") {
    return (subtotal * this.coupon.discountValue) / 100;
  }

  if (this.coupon.discountType === "fixed") {
    return Math.min(this.coupon.discountValue, subtotal);
  }

  return 0;
});

cartSchema.virtual("total").get(function () {
  return this.subtotal - this.discountAmount;
});

cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema)