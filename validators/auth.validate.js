const Joi = require('joi')

 
const passwordPattern =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?#&^()\-+=])[A-Za-z\d@$!%?#&^()\-+=]{8,128}$/;
const usernamePattern =
/^[a-zA-Z\u0600-\u06FF][a-zA-Z0-9\u0600-\u06FF._\-\s]*$/;
const phonePattern =
/^\+[1-9]\d{7,14}$/;
const registerSchema = Joi.object({

  username: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .pattern(usernamePattern)
    .required()
    .messages({
      'string.empty':'username is required',
      'string.min':'username must be at least 3 characters',
      'string.max':'username must not exceed 50 characters',
      'string.pattern.base':'username contains invalid characters'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({tlds:{allow:false}})
    .required()
    .messages({
      'string.email':'Invalid email format',
      'string.empty':'Email is required'
    }),

  password: Joi.string()
   .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty':'Password is required',
      'string.pattern.base':
      'Password must contain at least one  uppercase letter,one lowercase letter, one number and one special character'
    }),

 

  phone: Joi.string()
    .trim()
    .pattern(phonePattern)
    .required()
  
    .messages({
      'string.empty':'phone number is required',
      'string.pattern.base':
      ' phone number must be in international format'
    })

})
const verifyOtpSchema = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  code: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()

})
 const forgotPasswordSchema = Joi.object({

  email: Joi.string()
    .email()
    .required()

})
 const resetPasswordSchema = Joi.object({

  token:Joi.string().required(),

  newPassword: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty':'Password is required',
      'string.pattern.base':
      'Password must contain at least one  uppercase letter,one lowercase letter, one number and one special character'
    }),

})
const loginSchema = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required()

})
const changePasswordSchema=Joi.object({
  currentPassword: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty':'current Password is required',
      'string.pattern.base':
      'current Password must contain at least one  uppercase letter,one lowercase letter, one number and one special character'
    }),
  newPassword: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty':'new Password is required',
      'string.pattern.base':
      'new Password must contain at least one  uppercase letter,one lowercase letter, one number and one special character'
    }),
})
const changeRoleSchema = Joi.object({
    role: Joi.string()
        .valid("admin", "customer")
        .required()
});
// const editUserInfoSchema=Joi.object({
//    fullName: Joi.string()
//     .trim()
//     .min(3)
//     .max(50)
//     .pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    
//     .messages({
    
//       'string.min':'Full name must be at least 3 characters',
//       'string.max':'Full name must not exceed 50 characters',
//       'string.pattern.base':'Full name contains invalid characters'
//     }),

//   email: Joi.string()
//     .trim()
//     .lowercase()
//     .email()
   
//     .messages({
//       'string.email':'Invalid email format',
     
//     }),
//       phone: Joi.string()
//     .pattern(/^01[0125]\d{8}$/)
    
//     .messages({
//       'string.pattern.base':
//       'Invalid Egyptian phone number'
//     })

// })
module.exports={changeRoleSchema,registerSchema,verifyOtpSchema,changePasswordSchema,loginSchema,resetPasswordSchema,forgotPasswordSchema}