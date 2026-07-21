module.exports=(product)=>{
    return product.discountPrice > 0
            ? product.discountPrice
            : product.price
}