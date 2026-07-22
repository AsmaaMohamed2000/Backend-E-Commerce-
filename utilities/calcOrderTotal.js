module.exports = (items, coupon) => {

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );


    let discount = 0;


    if (coupon && coupon.code) {

        if (coupon.discountType === "percentage") {

            discount = Math.min(
                (subtotal * coupon.discountValue) / 100,
                subtotal
            );

        } else if (coupon.discountType === "fixed") {

            discount = Math.min(
                coupon.discountValue,
                subtotal
            );
        }
    }


    const shippingFee = subtotal >= 1000 ? 0 : 50;

    const tax = subtotal * 0.14;


    const totalPrice =
        subtotal + shippingFee + tax - discount;


    return {
        subtotal,
        shippingFee,
        tax,
        discount,
        totalPrice
    };
};