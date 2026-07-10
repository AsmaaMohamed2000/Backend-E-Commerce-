const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");
const uploadCloudinary = require("../utilities/cloudinary");
const mongoose=require('mongoose')
const AppError=require('../errors/AppError')
const {PRODUCT_ERRORS}=require('../constants/errors')
const validateObjectId=require('../utilities/validateObjectId')
const productFilter=require('../utilities/productFilter')
const sortProducts=require('../utilities/sort.js')
const productService = {

    createProduct: async (req) => {

    const {
        name,
        shortDescription,
        description,
        price,
        discountPrice,
        stock,
        sku,
        category,
        subcategory,
        brand,
        tags,
        featured,
        isActive
    } = req.body;

    if (!req.files || req.files.length === 0) {
        throw new AppError(PRODUCT_ERRORS.IMAGE_REQUIRED, 400);
    }

    if (stock !== undefined && Number(stock) < 0) {
        throw new AppError(PRODUCT_ERRORS.INVALID_STOCK, 400);
    }

    if (
        discountPrice !== undefined &&
        Number(discountPrice) >= Number(price)
    ) {
        throw new AppError(PRODUCT_ERRORS.INVALID_DISCOUNT, 400);
    }

    if (sku) {

        const exist = await Product.findOne({ sku });

        if (exist) {
            throw new AppError(PRODUCT_ERRORS.SKU_EXISTS, 409);
        }
    }

    const images = [];

    try {

        for (const file of req.files) {

            const result = await uploadCloudinary(
                file.buffer,
                "products"
            );

            images.push({
                public_id: result.public_id,
                url: result.secure_url
            });

        }

    } catch (err) {

        for (const img of images) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        throw err;
    }

    const product = await Product.create({

        name,
        shortDescription,
        description,
        price,
        discountPrice,
        stock,
        sku,
        category,
        subcategory,
        brand,
        tags,
        featured,
        isActive,
        images,
        createdBy: req.user.id

    });

    return product;

},
getProducts: async (req) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = productFilter(req.query);
      const  sort =sortProducts(req.query.sort)
  
    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .select("-reviews")
        .populate("createdBy", "username email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    return {

       pagination:{
         page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
       },
        products

    };

},
getProduct: async (req) => {

    const { id } = req.params

   validateObjectId(id)

    const product = await Product.findOne({
        _id:id,
        isActive:true
    }).populate('reviews.user','username avatar')
        .populate("createdBy", "username email");

    if (!product) {
        throw new AppError(PRODUCT_ERRORS. NOT_FOUND,404);
    }

   

    return product

},
updateProduct: async (req) => {

    const { id } = req.params;

    validateObjectId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    if (
        req.body.sku &&
        req.body.sku !== product.sku
    ) {

        const existingProduct = await Product.findOne({
            sku: req.body.sku,
            _id: { $ne: id }
        });

        if (existingProduct) {
            throw new AppError(
                PRODUCT_ERRORS.SKU_EXISTS,
                409
            );
        }

    }

    if (
        req.body.stock !== undefined &&
        Number(req.body.stock) < 0
    ) {
        throw new AppError(
            PRODUCT_ERRORS.INVALID_STOCK,
            400
        );
    }

    if (
        req.body.discountPrice !== undefined &&
        Number(req.body.discountPrice) >=
        Number(req.body.price ?? product.price)
    ) {
        throw new AppError(
            PRODUCT_ERRORS.INVALID_DISCOUNT,
            400
        );
    }

    const fields = [
        "name",
        "shortDescription",
        "description",
        "price",
        "discountPrice",
        "stock",
        "sku",
        "category",
        "subcategory",
        "brand",
        "tags",
        "featured",
        "isActive"
    ];

    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            product[field] = req.body[field];
        }
    });

    let deletedImages = req.body.deletedImages || [];

    if (!Array.isArray(deletedImages)) {
        deletedImages = [deletedImages];
    }

    const uploadedImages = [];

    try {

        // Upload new images first
        if (req.files?.length) {

            for (const file of req.files) {

                const result = await uploadCloudinary(
                    file.buffer,
                    "products"
                );

                uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });

            }

            product.images.push(...uploadedImages);

        }

        // Delete old images after upload succeeds
        for (const publicId of deletedImages) {

            await cloudinary.uploader.destroy(publicId);

            product.images = product.images.filter(
                image => image.public_id !== publicId
            );

        }

    } catch (error) {

        // Rollback uploaded images
        for (const image of uploadedImages) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        throw error;

    }

    if (product.images.length === 0) {
        throw new AppError(
            PRODUCT_ERRORS.IMAGE_REQUIRED,
            400
        );
    }

    await product.save();

    return product;

},
deleteProduct: async (req) => {

    const { id } = req.params;

    validateObjectId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    try {

        for (const image of product.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await product.deleteOne();

    } catch (error) {
        throw error;
    }

    return {
        message: "Product deleted successfully"
    };

},
// searchProducts: async (req) => {

//   const {
//         keyword,
//         category,
//         subcategory,
//         brand,
//         tag,
//         minPrice,
//         maxPrice,
//         sort
//     } = req.query;

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {
//         isActive: true
//     };

//     if (keyword) {
//         filter.$text = {
//             $search: keyword
//         };
//     }

//     if (category) {
//         filter.category = category.toLowerCase();
//     }

//     if (subcategory) {
//         filter.subcategory = subcategory;
//     }

//     if (brand) {
//         filter.brand = brand;
//     }

//     if (tag) {
//         filter.tags ={
//             $in:tag.split(',')
//         }
//     }

//     if (minPrice || maxPrice) {

//         filter.price = {};

//         if (minPrice) {
//             filter.price.$gte = Number(minPrice);
//         }

//         if (maxPrice) {
//             filter.price.$lte = Number(maxPrice);
//         }

//     }

//     let sortOption = {
//         createdAt: -1
//     };

//     switch (sort) {

//         case "priceAsc":
//             sortOption = {
//                 price: 1
//             };
//             break;

//         case "priceDesc":
//             sortOption = {
//                 price: -1
//             };
//             break;

//         case "rating":
//             sortOption = {
//                 averageRating: -1
//             };
//             break;

//         case "name":
//             sortOption = {
//                 name: 1
//             };
//             break;

//     }

//     const totalProducts =
//         await Product.countDocuments(filter);

//     const products = await Product.find(filter)
//         .select("-reviews")
//         .populate(
//             "createdBy",
//             "username email"
//         )
//         .sort(sortOption)
//         .skip(skip)
//         .limit(limit);

//     return {

//         page,

//         limit,

//         totalProducts,

//         totalPages: Math.ceil(
//             totalProducts / limit
//         ),

//         products

//     };

// },

addReview: async (req) => {

    const { id } = req.params;
    const { rating, comment } = req.body;

    validateObjectId(id);

    const product = await Product.findOne({
        _id: id,
        isActive: true
    });

    if (!product) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    const alreadyReviewed = product.reviews.some(
        review => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
        throw new AppError(
            PRODUCT_ERRORS.ALREADY_REVIEWED,
            409
        );
    }

    product.reviews.push({
        user: req.user.id,
        rating,
        comment
    });

    await product.calcAverageRating();

    await product.save();

    return product;

},
getReviews: async (req) => {

    const { id } = req.params;

    validateObjectId(id);

    const product = await Product.findOne({
        _id: id,
        isActive: true
    })
        .select("reviews averageRating numReviews")
        .populate(
            "reviews.user",
            "username avatar"
        )
        .lean();

    if (!product) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    return {
        totalReviews: product.numReviews,
        averageRating: product.averageRating,
        reviews: product.reviews
    };

},
deleteReview: async (req) => {

    const { id, rid } = req.params;

    validateObjectId(id);
    validateObjectId(rid);

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(
            PRODUCT_ERRORS.NOT_FOUND,
            404
        );
    }

    const review = product.reviews.id(rid);

    if (!review) {
        throw new AppError(
            PRODUCT_ERRORS.REVIEW_NOT_FOUND,
            404
        );
    }

    const isOwner =
        review.user.toString() === req.user.id;

    const isAdmin =
        req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new AppError(
            PRODUCT_ERRORS.FORBIDDEN,
            403
        );
    }

    review.deleteOne();

    await product.calcAverageRating();

    await product.save();

    return {
        message: "Review deleted successfully"
    };

},
}
module.exports = productService;