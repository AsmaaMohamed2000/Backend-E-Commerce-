module.exports=(query)=>{
     const filter = {
        isActive: true
    };

    if (query.keyword) {
        filter.$text = {
            $search: query.keyword
        };
    }

    if (query.category) {
        filter.category = query.category.toLowerCase();
    }

    if (query.subcategory) {
        filter.subcategory = query.subcategory;
    }

    if (query.brand) {
        filter.brand = query.brand;
    }

    if (query.tags) {
        filter.tags ={
            $in:query.tags.split(',')
        }
    }

    if (query.minPrice || query.maxPrice) {

        filter.price = {};

        if (query.minPrice) {
            filter.price.$gte = Number(query.minPrice);
        }

        if (query.maxPrice) {
            filter.price.$lte = Number(query.maxPrice);
        }

    }
    return filter
}