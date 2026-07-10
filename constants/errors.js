const PRODUCT_ERRORS = {
    IMAGE_REQUIRED: "Please upload at least one image",
    INVALID_STOCK: "Stock cannot be negative",
    INVALID_DISCOUNT: "Discount price must be less than price",
    SKU_EXISTS: "SKU already exists",
    NOT_FOUND: "Product not found",
    INVALID_ID: "Invalid product id",
    INVALID_RATING: "Rating must be between 1 and 5",
    ALREADY_REVIEWED: "You already reviewed this product",
    REVIEW_NOT_FOUND: "Review not found",
    FORBIDDEN: "You are not authorized to perform this action"
};

module.exports = { PRODUCT_ERRORS };