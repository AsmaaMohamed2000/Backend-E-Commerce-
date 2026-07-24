const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');


const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.route');
const cartRoutes = require('./routes/cart.route');
const wishlistRoutes = require('./routes/wishlist.routes');
const orderRoutes = require('./routes/order.route');
const webhook = require('./routes/webhook.route');
const adminRoutes = require('./routes/admin.route');
const errMiddleware = require('./middlewares/error.middleware');

const PORT = process.env.PORT || 4000;



   connectDB();
   


const rawClientUrl = process.env.CLIENT_URL || '';
const cleanClientUrl = rawClientUrl.replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  cleanClientUrl
].filter(Boolean);


app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      console.log('CORS Blocked Origin:', origin);
            callback(null, false); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));



app.use('/api/stripe', webhook);
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('Backend API is running successfully!');
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);


app.use(errMiddleware);


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}


module.exports = app;