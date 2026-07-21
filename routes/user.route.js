const express = require('express')
const router = express.Router()
const validateSchemas=require('../validators/auth.validate')
const userController = require('../controllers/user.controller')
const auth=require('../middlewares/authMiddleware')
const upload=require('../middlewares/uploads')
const userSchema=require('../validators/user.validate')
router.post("/add", auth.auth, auth.adminOnly('admin'), userController.addUser);
router.post("/change-password", auth.auth, auth.validate(validateSchemas.changePasswordSchema), userController.changePassword);

router.get("/all",auth.auth, auth.adminOnly("admin"),auth.ValidateQuery(userSchema. getUsersQuerySchema) ,userController.getAllUsers);

router.get("/:id", auth.auth, auth.adminOnly("admin"), userController.getUserById);

router.patch("/:id", auth.auth,upload.single('avatar'), userController.updateUser);

router.delete("/:id",  auth.auth, auth.adminOnly("admin"), userController.deleteUser);
module.exports = router