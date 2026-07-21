const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/User.model");
const Cart = require("../models/cart.model");
const Wishlist=require('../models/wishlist.model')
const dashboardService={
    getDashboardStats: async () => {

    const now = new Date();

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const [
        totalCustomers,
        totalAdmins,
        totalProducts,
        totalOrders,
        ordersByStatus,
        totalRevenueResult,
        currentMonthRevenueResult,
        lastMonthRevenueResult,
        topProducts,
        dailyRevenue,
        recentOrders
    ] = await Promise.all([

        User.countDocuments({
            role: "customer"
        }),
   User.countDocuments({
            role: "admin"
        }),
        Product.countDocuments(),

        Order.countDocuments(),

        Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]),

        Order.aggregate([
             {
                $match: {
                    paymentStatus: "paid",
                  
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]),

        Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: startOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]),

        Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: startOfLastMonth,
                        $lt: startOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]),

        Order.aggregate([
            {
               $match:{
                 paymentStatus:"paid"
               }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: "$items.product",

                    name: {
                        $first: "$items.name"
                    },

                    image: {
                        $first: "$items.image"
                    },

                    totalSold: {
                        $sum: "$items.quantity"
                    },

                    revenue: {
                        $sum: {
                            $multiply: [
                                "$items.price",
                                "$items.quantity"
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    totalSold: -1
                }
            },
            {
                $limit: 5
            }
        ]),

        Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: last7Days
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },

                    revenue: {
                        $sum: "$totalPrice"
                    },

                    orders: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]),

        Order.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 })
            .limit(5).lean()

    ]);

    const totalRevenue =
        totalRevenueResult[0]?.totalRevenue || 0;

    const currentMonthRevenue =
        currentMonthRevenueResult[0]?.revenue || 0;

    const lastMonthRevenue =
        lastMonthRevenueResult[0]?.revenue || 0;



 const orderStats = {
    pending: 0,
    processing: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
};

ordersByStatus.forEach(item => {
    orderStats[item._id] = item.count;
});
    const dailyRevenueMap = new Map(
  dailyRevenue.map(item => [item._id, item])
);

const dailyRevenueResult = [];

for (let i = 0; i < 7; i++) {
  const date = new Date(last7Days);
  date.setDate(last7Days.getDate() + i);

  const dateString = date.toLocaleDateString("en-CA");

  dailyRevenueResult.push(
    dailyRevenueMap.get(dateString) || {
      _id: dateString,
      revenue: 0,
      orders: 0
    }
  );
}   
const revenueGrowth =
lastMonthRevenue > 0
? Number(
   (
   ((currentMonthRevenue-lastMonthRevenue)/
   lastMonthRevenue)*100
   ).toFixed(2)
)
: currentMonthRevenue > 0
? 100 :0

    return {

        totalCustomers,
totalAdmins,
        totalProducts,

      orders:{
          totalOrders,
          ...orderStats
      },

     revenue:{
           totalRevenue,

        currentMonthRevenue,

        lastMonthRevenue,

        revenueGrowth,
     },

        ordersByStatus,

        topProducts,

        dailyRevenueResult,

        recentOrders

    };

},
getAllCarts : async (query) => {

  const page = Math.max(Number(query.page) || 1,1);
    const limit = Math.min(Math.max(Number(query.limit) || 10,1),100);
    const skip = (page - 1) * limit;

    const [carts, total] = await Promise.all([
      Cart.find().populate('user', 'username email').skip(skip).limit(limit).lean(),
      Cart.countDocuments()
    ]);

   return {
      success: true,
      count: carts.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: carts
   }
  
},


getAllWishlists : async (query) => {
  
  const page = Math.max(Number(query.page) || 1,1);
    const limit = Math.min(Math.max(Number(query.limit) || 10,1),100);
    const skip = (page - 1) * limit;


    const wishlists = await Wishlist.find()
      .populate('user', 'username email')
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Wishlist.countDocuments();

    return {
        success: true, count: wishlists.length, total, data: wishlists 
    }
  
},


getWishlistStats :async () => {
 
    const stats = await Wishlist.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: '$productDetails' },
    {
 $project:{
  _id:1,
  count:1,
  name:"$productDetails.name",
  price:{
    $ifNull:[
      "$productDetails.discountPrice",
      "$productDetails.price"
    ]
  }
 }
}
    ]);

 return {
    success: true, data: stats 
 }
}
}
module.exports=dashboardService