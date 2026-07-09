const productController = require('../controllers/product.controller')
const auth=require('../middlewares/authMiddleware')
const upload=require('../middlewares/uploads')
const validate=require('../validators/product.validate');
const express = require('express')
const router = express.Router()
router.post(
    "/",
    auth.auth,
    auth.adminOnly('admin'),
    upload.array("images", 5),
    auth.validate(validate.createProductSchema),
    productController.createProduct
);
router.get('/',productController.getProducts)
router.get('/search',productController.searchProducts)
router.get('/:id',productController.getProduct)
router.put(
    "/update/:id",
    auth.auth,
    auth.adminOnly('admin'),
    upload.array("images", 5),
    auth.validate(validate.updateProductSchema),
    productController.updateProduct
);
router.delete(
    "/:id",
    auth.auth,
    auth.adminOnly('admin'),
   
    productController.deleteProduct
);
router.post(
    "/:id/reviews",
    auth.auth,
    auth.validate(validate.reviewSchema),
    productController.addReview
);
router.get('/:id/reviews',productController.getReviews)
router.delete('/:id/reviews/:rid',  auth.auth,productController.deleteReview)
module.exports=router