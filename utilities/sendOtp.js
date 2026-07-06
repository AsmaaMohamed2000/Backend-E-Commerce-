// const brevo = require("../config/brevo.config");
// const { otpTemplate } = require("./emailTemplate");

// const sendOtp = async (email, username, otp) => {
//   try {
//     await brevo.post("/smtp/email", {
//       sender: {
//         name: process.env.BREVO_SENDER_NAME,
//         email: process.env.BREVO_SENDER_EMAIL,
//       },
//       to: [{ email }],
//       subject: "Verify your email",
//       htmlContent: otpTemplate(username, otp),
//     });
//   } catch (error) {
//     console.log("Brevo error:", error.response?.data || error.message);
//     throw new Error("Failed to send verification email");
//   }
// };

// module.exports = sendOtp;