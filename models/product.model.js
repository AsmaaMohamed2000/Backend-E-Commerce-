const mongoose = require("mongoose");
const slugify = require("slugify");

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 500,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    sku: {
      type: String,
      unique: true,sparse:true
    },

    images: {
      type: [imageSchema],
      required: true,
    },

    category: {
      type: String,
      required: true,
      lowercase: true,
    },

    subcategory: {
      type: String,
    },

    brand: {
      type: String,
    },

    tags: [
      {
        type: String,
      },
    ],

    reviews: [reviewSchema],

    averageRating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1, price: 1, averageRating: -1, createdAt: -1 });
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now()}`;

  }
});
productSchema.methods.calcAverageRating =async  function () {

    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.numReviews = 0;
          
        return;
    }

    const totalRating = this.reviews.reduce((total, review) => {
        return total + review.rating;
    }, 0);

    this.averageRating = Number(
        (totalRating / this.reviews.length).toFixed(1)
    );

    this.numReviews = this.reviews.length;
      

};

module.exports = mongoose.model("Product", productSchema)