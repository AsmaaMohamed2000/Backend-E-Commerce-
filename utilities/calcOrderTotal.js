module.exports = (cart) => {

    const subtotal = cart.subtotal;

    const discount = cart.discountAmount;

    const shippingFee = subtotal >= 1000 ? 0 : 50;

    const tax = subtotal * 0.14;

    const totalPrice = subtotal + shippingFee + tax - discount;

    return {
        subtotal,
        shippingFee,
        tax,
        discount,
        totalPrice
    };
};