

const Joi = require("joi");

const createOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().trim().required(),

    phone: Joi.string().trim().required(),

    country: Joi.string().trim().required(),

    city: Joi.string().trim().required(),

    address: Joi.string().trim().required(),

    postalCode: Joi.string().trim().required(),
  }).required(),

  paymentMethod: Joi.string()
    .valid("cash", "stripe", "paypal", "paymob")
    .default("cash"),

  customerNote: Joi.string()
    .trim()
    .max(1000)
    .allow("")
    .optional(),
});



const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned"
    )
    .required(),

  adminNote: Joi.string()
    .trim()
    .max(1000)
    .allow("")
    .optional(),
});
module.exports={createOrderSchema,updateOrderStatusSchema}