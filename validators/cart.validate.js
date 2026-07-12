const Joi = require("joi");
const mongoose = require("mongoose");


const addItemSchema = Joi.object({
  productId: Joi.string()
    .required()
   
    .messages({
      "string.empty": "Product id is required",
     
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
    }),
});

const updateQuantitySchema = Joi.object({
  productId: Joi.string()
    .required()
  
    .messages({
      "string.empty": "Product id is required",
     
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
    }),
});

const applyCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .required()
    .messages({
      "string.empty": "Coupon code is required",
    }),
});

module.exports = {
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
};