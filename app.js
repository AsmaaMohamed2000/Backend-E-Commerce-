// app.js
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.route');
const cartRoutes = require('./routes/cart.route');
const wishlistRoutes = require('./routes/wishlist.routes');
const orderRoutes = require('./routes/order.route');
const webhook = require('./routes/webhook.route');
const errMiddleware = require('./middlewares/error.middleware');
const adminRoutes = require('./routes/admin.route');
const cors = require('cors');

// السماح بالـ Frontend على Production أو Localhost
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL // ضَع رابط الفرونت إند الخاص بك في Vercel تحت اسم CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // السماح بالطلبات التي لا تملك origin (مثل Postman أو Server-to-Server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // أو اختر التعامل معها بحزم
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use('/api/stripe', webhook);

app.use(express.json());
app.use(cookieParser());

// مسار الصفحة الرئيسية للتأكد من أن السيرفر والمتغيرات تعمل
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend API is running successfully!',
    mongoConnected: !!process.env.MONGO_URL
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use(errMiddleware);

module.exports = app;