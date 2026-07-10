module.exports=(query)=>{
     let sort = { createdAt: -1 };

    switch (query) {

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
    return sort
}