# 🛍️ MERN E-Commerce Backend API

A full-featured *E-Commerce REST API* built with the *MERN Stack*. The project provides secure authentication, product management, shopping cart, order processing, Stripe online payments, Cloudinary image uploads, and an admin dashboard.

---

# 📌 Overview

This project is designed to power a complete e-commerce application with modern backend architecture and secure payment processing.

It supports:

* User Authentication & Authorization
* Product Management
* Shopping Cart
* Wishlist
* Order Management
* Stripe Online Payments
* Cash on Delivery
* Cloudinary Image Upload
* Reviews & Ratings
* Admin Dashboard
* Email Notifications

---

# 🚀 Features

## 👤 Authentication

* User Registration
* Email Verification
* Login
* Logout
* JWT Authentication
* Refresh Token Authentication
* Forgot Password
* Reset Password
* Change Password
* Role-based Authorization (Admin / Customer)

---

## 🛒 Products

* Create Product
* Update Product
* Delete Product
* Get Product Details
* Get All Products
* Search Products
* Product Filtering
* Product Sorting
* Pagination
* Product Reviews
* Product Ratings

---

## ❤️ Wishlist

* Add Product to Wishlist
* Remove Product
* Get Wishlist

---

## 🛍️ Cart

* Add Product
* Update Quantity
* Remove Product
* Clear Cart
* Calculate Totals
* Coupon Support

---

## 📦 Orders

* Create Cash Order
* Create Stripe Order
* Order History
* Order Details
* Update Order Status
* Cancel Order
* Admin Order Management

---

## 💳 Stripe Integration

The project uses *Stripe Payment Intents*.

Workflow:

1. User creates an order.
2. Backend creates a Stripe Payment Intent.
3. Client receives the Client Secret.
4. User completes payment using Stripe Elements.
5. Stripe sends a Webhook.
6. Backend verifies the webhook signature.
7. Order payment status becomes *Paid*.
8. Product stock is reduced.
9. If stock becomes unavailable during payment confirmation, the payment can be refunded automatically.

---

## ☁️ Cloudinary

Images are uploaded to Cloudinary.

Features:

* Upload Product Images
* Update Images
* Delete Old Images
* User Avatar Upload

---

## ⭐ Reviews

* Add Review
* Update Rating
* Product Rating Average
* Prevent Duplicate Reviews

---

## 📊 Admin Dashboard

Dashboard includes:

* Total Users
* Total Products
* Total Orders
* Revenue Statistics
* Monthly Revenue
* Recent Orders
* Orders by Status
* Top Selling Products

---

# 🔐 Security

* JWT Access Token
* Refresh Token
* Password Hashing (bcrypt)
* Protected Routes
* Role Authorization
* Input Validation
* Secure Password Reset Tokens

---

# 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT
* bcrypt

### Payments

* Stripe Payment Intents
* Stripe Webhooks

### File Upload

* Multer
* Cloudinary

### Validation

* Joi

### Other

* Nodemailer
* Cookie Parser
* dotenv

---

# 📂 Project Structure

text
backend
│
├── config/
├── constants/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utilities/
├── validators/
├── app.js
├── server.js
└── package.json


---

# ⚙️ Installation

Clone the repository

bash
git clone https://github.com/your-username/your-repository.git


Move to the project folder

bash
cd backend


Install dependencies

bash
npm install


Create a .env file.

Run the server

bash
npm run dev


---

# 🌍 Environment Variables

Create a .env file and add:

env
PORT=

MONGO_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

ACCESS_TOKEN_EXPIRE=

REFRESH_TOKEN_EXPIRE=

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

CLIENT_URL=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_HOST=

EMAIL_PORT=

EMAIL_USER=

EMAIL_PASS=


---

# 💳 Stripe Test Card

Use the following card for testing:

text
Card Number: 4242 4242 4242 4242

Expiry: Any future date

CVC: Any 3 digits

ZIP: Any value


---

# 📡 API Modules

* Authentication
* Users
* Products
* Categories
* Brands
* Cart
* Wishlist
* Orders
* Reviews
* Dashboard

---

# 🔄 Order Flow

text
Customer
      │
      ▼
Create Order
      │
      ▼
Create Payment Intent
      │
      ▼
Stripe Checkout
      │
      ▼
Webhook
      │
      ▼
Payment Success
      │
      ▼
Reduce Product Stock
      │
      ▼
Complete Order


---

# 🧪 Frontend Test

A lightweight React application is included to test Stripe payments using:

* React
* Axios
* Stripe Elements
* PaymentElement
* Client Secret

Payment flow:

text
Create Order
      │
      ▼
Receive Client Secret
      │
      ▼
Render Stripe Payment Element
      │
      ▼
Confirm Payment
      │
      ▼
Webhook Updates Order


---

# 📌 Future Improvements

* Product Variants
* Coupons Management
* Inventory Notifications
* Shipping Providers
* Multi-language Support
* Analytics Dashboard
* Unit Testing
* Docker Support
* CI/CD Pipeline

---

# 👨‍💻 Author

*Asmaa Mohamed Ali*

Backend Developer | MERN Stack Developer

---

# 📄 License

This project is available for educational and personal use.