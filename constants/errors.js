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
    FORBIDDEN: "You are not authorized to perform this action",
    REVIEW_PURCHASE:"you must purchase this product before add review"
};
const CART_ERRORS = {
    CART_NOT_FOUND: "Cart not found",

    PRODUCT_ALREADY_IN_CART: "Product already exists in cart",

    PRODUCT_NOT_IN_CART: "Product not found in cart",

    INSUFFICIENT_STOCK: "Insufficient stock available",

    CART_IS_EMPTY: "Cart is empty",

    INVALID_COUPON: "Invalid coupon code",

    COUPON_ALREADY_APPLIED: "Coupon is already applied",

    NO_COUPON_APPLIED: "No coupon applied",

    PRODUCT_INACTIVE: "This product is no longer available",
    INVALID_QUANTITY:"invalide quantity",

    QUANTITY_EXCEEDS_STOCK: "Requested quantity exceeds available stock"
};
const WISHLIST_ERRORS = {
    WISHLIST_NOT_FOUND: "Wishlist not found",
    WISHLIST_IS_EMPTY: "Wishlist is empty",
    PRODUCT_ALREADY_EXISTS: "Product already exists in wishlist",
    PRODUCT_NOT_FOUND: "Product not found in wishlist",
};
const USER_ERRORS = {
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  UNAUTHORIZED: "Unauthorized to update this profile",
CANNOT_DELETE_SELF:"can not delete yourself",
  NO_UPDATE_DATA: "No data provided to update",
  INVALID_ADDRESSES: "Addresses must be an array",
  USE_CHANGE_PASSWORD_ROUTE:
    "Use the change password route to update your password",
  MULTIPLE_DEFAULT_ADDRESSES:
    "Only one default address is allowed",
INCORRECT_PASSWORD:'Current password is incorrect',
DATA_EMPTY:'no data to update',
  ROLE_ROUTE: "Go to change role route",
  SAME_PASSWORD:'New password must be different from current password',
  PASSWORDS_REQUIRED:'Current password and new password are required'
};

const USER_SUCCESS = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  PASSWORD_CHANGED: "Password changed successfully",
};
const ORDER_ERRORS = {
    ORDER_NOT_FOUND: "Order not found.",
    ORDER_ALREADY_CANCELLED: "Order is already cancelled.",
    ORDER_CANNOT_BE_CANCELLED: "Order cannot be cancelled.",
    CART_IS_EMPTY: "Your cart is empty.",
    CART_NOT_FOUND: "Cart not found.",
    INVALID_ORDER_STATUS: "Invalid order status.",
    ORDER_ACCESS_DENIED: "You are not authorized to access this order.",
    PRODUCT_NOT_AVAILABLE: " product are no longer available.",
    PRODUCT_INACTIVE: "One or more products are inactive.",
    PAYMENT_ALREADY_COMPLETED: "Order has already been paid.",
    ORDER_ALREADY_DELIVERED:"order already delivered"
};

;

module.exports = { USER_ERRORS,ORDER_ERRORS,
  USER_SUCCESS, PRODUCT_ERRORS ,CART_ERRORS,WISHLIST_ERRORS};