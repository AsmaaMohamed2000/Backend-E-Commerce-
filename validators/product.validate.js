const Joi = require("joi");

// Create Product
const createProductSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),

  shortDescription: Joi.string().trim().max(500).required(),

  description: Joi.string().trim().required(),

  price: Joi.number().min(0).required(),

  discountPrice: Joi.number().min(0).default(0),

  stock: Joi.number().integer().min(0).required(),

  sku: Joi.string().trim().allow("", null),

  category: Joi.string().trim().required(),

  subcategory: Joi.string().trim().allow("", null),

  brand: Joi.string().trim().allow("", null),

  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string()
  ),

  featured: Joi.boolean(),

  isActive: Joi.boolean()
});


// Update Product
const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(200),

  shortDescription: Joi.string().trim().max(500),

  description: Joi.string().trim(),

  price: Joi.number().min(0),

  discountPrice: Joi.number().min(0),

  stock: Joi.number().integer().min(0),

  sku: Joi.string().trim().allow("", null),

  category: Joi.string().trim(),

  subcategory: Joi.string().trim().allow("", null),

  brand: Joi.string().trim().allow("", null),

  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string()
  ),

  featured: Joi.boolean(),

  isActive: Joi.boolean(),

  deletedImages: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  )
}).min(1);


// Add Review
const reviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .trim()
    .max(1000)
    .allow("")
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  reviewSchema
};