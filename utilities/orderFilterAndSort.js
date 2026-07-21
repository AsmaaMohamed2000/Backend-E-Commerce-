
const filter=(query)=>{
const filtered = {
    };

   const {user,status,paymentStatus,paymentMethod,search,fromDate,toDate} =query
    //   if(userId){
    //     filtered.user=userId
    // }
     if (user) {
        filtered.user = user;
    }
    if (status) {
        filtered.status = status;
    }

    if (paymentStatus) {
        filtered.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
        filtered.paymentMethod = paymentMethod;
    }

    if (search) {
        filtered.$or = [
            {
                customerNote: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                "shippingAddress.fullName": {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                "shippingAddress.phone": {
                    $regex: search,
                    $options: "i"
                }
            },
              {
                "shippingAddress.city": {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    if (fromDate || toDate) {

        filtered.createdAt = {};

        if (fromDate) {
            filtered.createdAt.$gte = new Date(fromDate);
        }

        if (toDate) {
            filtered.createdAt.$lte = new Date(toDate);
        }

    }
    return filtered
}


const sortedOrder=(query)=>{
     let sortOption = {};

    switch (query?.sort) {

        case "oldest":
            sortOption = { createdAt: 1 };
            break;

        case "priceAsc":
            sortOption = { totalPrice: 1 };
            break;

        case "priceDesc":
            sortOption = { totalPrice: -1 };
            break;

        default:
            sortOption = { createdAt: -1 };

    }
    return sortOption
}
module.exports={filter,sortedOrder}
//http://localhost:4000/api/orders/my?status=pending&paymentStatus=pending&paymentMethod=stripe&search=asm&fromDate=2026-07-4&toDate=2026-07-15