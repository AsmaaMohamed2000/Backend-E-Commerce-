const Product = require("../models/product.model");
const Order = require("../models/order.model.js");
const cloudinary = require("../config/cloudinary");
const uploadCloudinary = require("../utilities/cloudinary");
const mongoose=require('mongoose')
const AppError=require('../errors/AppError')
const {PRODUCT_ERRORS, ORDER_ERRORS}=require('../constants/errors')
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
        featured,
        isActive
    } = req.body;
let tags = req.body.tags;
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


if (typeof tags === "string") {
    try {
        tags = JSON.parse(tags);
    } catch {
        tags = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);
    }
}

if (Array.isArray(tags)) {
    tags = tags.map(tag => tag.trim().toLowerCase());
}
    const images = [];
    let product

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
           product = await Product.create({

        name,
        shortDescription,///
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

    } catch (err) {

        for (const img of images) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        throw err;
    }

  

    return product;

},
getProducts: async (req) => {

    const page = Math.max(Number(req.query.page) || 1,1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10,1),100);
    const skip = (page - 1) * limit;

    const filter = productFilter(req.query);
      const  sort =sortProducts(req.query.sort)
  
  const [totalProducts, products] = await Promise.all([
    Product.countDocuments(filter),

    Product.find(filter)
        .select("-reviews")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
]);

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
let tags = req.body.tags;

if (tags !== undefined) {

    if (typeof tags === "string") {
        try {
            tags = JSON.parse(tags);
        } catch {
            tags = tags
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);
        }
    }

    if (Array.isArray(tags)) {
        tags = tags.map(tag => tag.trim().toLowerCase());
    }

    product.tags = tags;
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
               if(product.images.some(img=>img.public_id===publicId))
         {
                await cloudinary.uploader.destroy(publicId);

            product.images = product.images.filter(
                image => image.public_id !== publicId
            );
         }
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

  
product.isActive=false
await product.save()
    return {
        message: "Product deleted successfully"
    };

},


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
const bought=await Order.findOne({
    user:req.user.id,
    status:"delivered",
   'items.product':product._id
})
if(!bought) throw new AppError(PRODUCT_ERRORS. REVIEW_PURCHASE,400)
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
        rating:Number(rating),
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
        review.user.toString() === req.user.id.toString();

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