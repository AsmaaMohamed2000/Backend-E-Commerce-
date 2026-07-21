const Joi = require("joi");
const userSchemas={
    getUsersQuerySchema : Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),

  search: Joi.string().allow(""),

  role: Joi.string().valid("admin", "customer"),

  isVerified: Joi.boolean(),

  sort: Joi.string().valid(
    "username",
    "-username",
    "email",
    "-email",
    "createdAt",
    "-createdAt"
  ).default("-createdAt")
}
)
}
module.exports=userSchemas