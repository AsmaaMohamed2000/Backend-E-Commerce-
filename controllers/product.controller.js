const productService = require("../services/product.service");

const productController = {

    createProduct: async (req, res, next) => {
        try {

            const product = await productService.createProduct(req);

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product
            });

        } catch (error) {
            next(error);
        }
    },

    getProducts: async (req, res, next) => {
        try {

            const result = await productService.getProducts(req);

            res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            next(error);
        }
    },

    getProduct: async (req, res, next) => {
        try {

            const product = await productService.getProduct(req);

            res.status(200).json({
                success: true,
                data: product
            });

        } catch (error) {
            next(error);
        }
    },

    updateProduct: async (req, res, next) => {
        try {

            const product = await productService.updateProduct(req);

            res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product
            });

        } catch (error) {
            next(error);
        }
    },

    deleteProduct: async (req, res, next) => {
        try {

            await productService.deleteProduct(req);

            res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });

        } catch (error) {
            next(error);
        }
    },

  

    addReview: async (req, res, next) => {
        try {

            const product = await productService.addReview(req);

            res.status(201).json({
                success: true,
                message: "Review added successfully",
                data: product
            });

        } catch (error) {
            next(error);
        }
    },

    getReviews: async (req, res, next) => {
        try {

            const result = await productService.getReviews(req);

            res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            next(error);
        }
    },

    deleteReview: async (req, res, next) => {
        try {

            const result = await productService.deleteReview(req);

            res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            next(error);
        }
    }

};

module.exports = productController;