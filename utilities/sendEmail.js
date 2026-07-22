


const transporter = require("../config/email.config");

const sendEmail = async ({
 email,
  subject,
  username,
  otp,
  resetUrl,
  type,
  orderId,
  items,
  subtotal,
  shippingFee,
  tax,
  discount,
  totalPrice,
  paymentMethod,
  adminNote,
  status
}) => {
  let html = "";

  if (type === "otp") {
    html = `
      <h2>Hello ${username}</h2>

      <p>Your verification code is:</p>

      <h1>${otp}</h1>

      <p>This code expires in 5 minutes.</p>
    `;
  }

  if (type === "reset-password") {
    html = `
      <h2>Reset your password</h2>

      <p>Click the link below to reset your password.</p>

      <a href="${resetUrl}">Reset Password</a>

      <p>This link expires in 10 minutes.</p>
    `;
  }
  if (type === "set-password") {
  html = `
    <h2>Welcome ${username}</h2>

    <p>Your account has been created successfully.</p>

    <p>Click the button below to set your password.</p>

    <a href="${resetUrl}">Set Password</a>

    <p>This link expires in 10 minutes.</p>
  `;
}
if (type === "order-confirmation") {

  const rows = items.map(item => `
      <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price} EGP</td>
          <td>${item.price * item.quantity} EGP</td>
      </tr>
  `).join("");

  html = `
    <div style="font-family:Arial,sans-serif">

      <h2>Order Confirmation</h2>

      <p>Hello <strong>${username}</strong>,</p>

      <p>Thank you for your order. Your order has been placed successfully.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <table
        border="1"
        cellpadding="10"
        cellspacing="0"
        style="border-collapse:collapse;width:100%;text-align:center"
      >
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

      <br>

      <p><strong>Subtotal:</strong> ${subtotal} EGP</p>

      <p><strong>Shipping:</strong> ${shippingFee} EGP</p>

      <p><strong>Tax:</strong> ${tax} EGP</p>

      <p><strong>Discount:</strong> ${discount} EGP</p>

      <h3>Total: ${totalPrice} EGP</h3>

      <p><strong>Payment Method:</strong> ${paymentMethod}</p>

      <hr>

      <p>Thank you for shopping with Ecommerce </p>

    </div>
  `;
}
if (type === "order-status") {
  html = `
    <h2>Order Status Updated</h2>

    <p>Hello ${username},</p>

    <p>Your order <strong>${orderId}</strong> has been updated.</p>

    <p><strong>Current Status:</strong> ${status}</p>

    ${
      adminNote
        ? `<p><strong>Admin Note:</strong> ${adminNote}</p>`
        : ""
    }

    <p>Thank you for shopping with Ecommerce </p>
  `
}

  await transporter.sendMail({
    from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = sendEmail;



