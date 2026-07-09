const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");
const uploadCloudinary = require("../utilities/cloudinary");
const mongoose=require('mongoose')
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
            throw new Error("Please upload at least one image");
        }
 if (stock && Number(stock)<0) {
            throw new Error("stock can not be negative");
        }
        if (discountPrice&&Number(discountPrice)>=Number(price)) {
            throw new Error("discount price must be less than price");
        }
        const images = [];

       

          try{
             for (const file of req.files) {
              const result = await uploadCloudinary(file.buffer, "products");

            images.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        };
          }catch(err){
           
for (const img of images) {
  await cloudinary.uploader.destroy(img.public_id);
}          
            
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
    const limit = Number(req.query.limit) || 2;

    const skip = (page - 1) * limit;

    const filter = {
        isActive: true
    };

    if (req.query.category) {
        filter.category = req.query.category.toLowerCase();
    }

    if (req.query.brand) {
        filter.brand = req.query.brand;
    }

    if (req.query.minPrice || req.query.maxPrice) {

        filter.price = {};

        if (req.query.minPrice) {
            filter.price.$gte = Number(req.query.minPrice);
        }

        if (req.query.maxPrice) {
            filter.price.$lte = Number(req.query.maxPrice);
        }

    }

    let sort = {
        createdAt: -1
    };

    switch (req.query.sort) {

        case "priceAsc":
            sort = { price: 1 };
            break;

        case "priceDesc":
            sort = { price: -1 };
            break;

        case "rating":
            sort = { averageRating: -1 };
            break;

        case "name":
            sort = { name: 1 };
            break;

    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit).select('-reviews')
        .populate("createdBy", "username email");

    return {

        page,
        limit,

        totalProducts,

        totalPages: Math.ceil(totalProducts / limit),

        products

    };

},
getProduct: async (req) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product id");
    }

    const product = await Product.findById(id).populate('reviews.user','username avatar')
        .populate("createdBy", "username email");

    if (!product) {
        throw new Error("Product not found");
    }

    if (!product.isActive) {
        throw new Error("Product not found");
    }

    return product;

},
updateProduct: async (req) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product not found");
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

    for (const publicId of deletedImages) {

        await cloudinary.uploader.destroy(publicId);

        product.images = product.images.filter(
            image => image.public_id !== publicId
        );

    }

    if (req.files && req.files.length > 0) {

        for (const file of req.files) {

            const result = await uploadCloudinary(
                file.buffer,
                "products"
            );

            product.images.push({
                public_id: result.public_id,
                url: result.secure_url
            });

        }

    }
if(product.imaged.length===0){
    throw new Error('product must  have at least one image')
}
    await product.save();

    return product;

},
deleteProduct: async (req) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product not found");
    }

    for (const image of product.images) {

        await cloudinary.uploader.destroy(image.public_id);

    }

    await Product.findByIdAndDelete(id);

},
searchProducts: async (req) => {

  const {
        keyword,
        category,
        subcategory,
        brand,
        tag,
        minPrice,
        maxPrice,
        sort
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
        isActive: true
    };

    if (keyword) {
        filter.$text = {
            $search: keyword
        };
    }

    if (category) {
        filter.category = category.toLowerCase();
    }

    if (subcategory) {
        filter.subcategory = subcategory;
    }

    if (brand) {
        filter.brand = brand;
    }

    if (tag) {
        filter.tags ={
            $in:tag.split(',')
        }
    }

    if (minPrice || maxPrice) {

        filter.price = {};

        if (minPrice) {
            filter.price.$gte = Number(minPrice);
        }

        if (maxPrice) {
            filter.price.$lte = Number(maxPrice);
        }

    }

    let sortOption = {
        createdAt: -1
    };

    switch (sort) {

        case "priceAsc":
            sortOption = {
                price: 1
            };
            break;

        case "priceDesc":
            sortOption = {
                price: -1
            };
            break;

        case "rating":
            sortOption = {
                averageRating: -1
            };
            break;

        case "name":
            sortOption = {
                name: 1
            };
            break;

    }

    const totalProducts =
        await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .select("-reviews")
        .populate(
            "createdBy",
            "username email"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    return {

        page,

        limit,

        totalProducts,

        totalPages: Math.ceil(
            totalProducts / limit
        ),

        products

    };

},


addReview: async (req) => {

    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product id");
    }

    const product = await Product.findById(id);

    if (!product ||!product.isActive) {
        throw new Error("Product not found");
    }
  if (rating<1 || rating>5) {
        throw new Error("rating must be between 1 and 5");
    }
    const alreadyReviewed = product.reviews.some(
        review => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
        throw new Error("You already reviewed this product");
    }

    product.reviews.push({
        user: req.user.id,
        rating,
        comment
    });

    product.calcAverageRating();

    await product.save();

    return product;

},
getReviews: async (req) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product id");
    }

    const product = await Product.findById(id)
        .populate(
            "reviews.user",
            "username avatar"
        );

    if (!product || !product.isActive) {
        throw new Error("Product not found");
    }

    return {

        totalReviews: product.numReviews,

        averageRating: product.averageRating,

        reviews: product.reviews

    };

},
deleteReview: async (req) => {

    const { id, rid } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(rid)
    ) {
        throw new Error("Invalid id");
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new Error("Product not found");
    }

    const review = product.reviews.id(rid);

    if (!review) {
        throw new Error("Review not found");
    }

    const isOwner =
        review.user.toString() === req.user.id;

    const isAdmin =
        req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized");
    }

    review.deleteOne();

    product.calcAverageRating();

    await product.save();

    return {
        message: "Review deleted successfully"
    };


}
}
module.exports = productService;