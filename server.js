const express=require('express')
const app=express()
const router=express.Router()
const dotenv=require('dotenv')
dotenv.config()
const cookieParser = require('cookie-parser')
const authRoutes=require('./routes/auth.route')
const userRoutes=require('./routes/user.route')
const productRoutes=require('./routes/product.route')
const cartRoutes=require('./routes/cart.route')
const wishlistRoutes=require('./routes/wishlist.routes')
const orderRoutes=require('./routes/order.route')
const webhook=require('./routes/webhook.route')
const errMiddleware=require('./middlewares/error.middleware')
const adminRoutes=require('./routes/admin.route')
const cors=require('cors')
const connectDB=require('./config/db')

const PORT=process.env.PORT || 4000

 connectDB()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use('/api/stripe',webhook)

app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
  res.send('Backend API is running successfully!');
});
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)

app.use('/api/products',productRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/wishlist',wishlistRoutes)
app.use('/api/orders',orderRoutes)
app.use('/api/admin',adminRoutes)
app.use(errMiddleware)
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})