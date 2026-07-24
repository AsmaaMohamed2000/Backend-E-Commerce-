const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.pre(/^find/, function () {
  this.populate({
    path: "products",
    match:{isActive:true},
    select:
      "name slug shortDescription price discountPrice images averageRating numReviews stock  brand",
  });

 
});

module.exports = mongoose.model("Wishlist", wishlistSchema);