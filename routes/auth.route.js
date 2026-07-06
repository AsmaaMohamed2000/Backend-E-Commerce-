const express = require('express')
const router = express.Router()
const validateSchemas=require('../validators/auth.validate')
const authController = require('../controllers/auth.controller')
const auth=require('../middlewares/authMiddleware')
const upload=require('../middlewares/uploads')
router.post('/register/send-otp',upload.single('avatar'),auth.validate(validateSchemas.registerSchema), authController.register)

router.post('/verify-otp',auth.validate(validateSchemas.verifyOtpSchema) ,authController.verifyOtp)

router.post('/login',auth.validate(validateSchemas.loginSchema) ,authController.login)

router.post('/refresh-token', authController.refreshToken)


router.post('/logout',auth.auth , authController.logout)
router.get('/me',auth.auth ,authController.getMe)

router.post('/forgot-password/send-otp',auth.validate(validateSchemas.forgotPasswordSchema) ,authController.forgotPassword)

router.post('/reset-password/verify-otp',auth.validate(validateSchemas.resetPasswordSchema), authController.resetPassword)

module.exports = router