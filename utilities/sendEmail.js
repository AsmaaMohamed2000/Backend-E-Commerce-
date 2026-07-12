

// const transporter = require("../config/email.config");

// const sendOtp = async (email, username, otp) => {

    
//       await transporter.sendMail({

//         from:  `"Ecommerce" <${process.env.EMAIL_USER}>`,

//         to: email,

//         subject: "Verify Your Email",

//         html: `
//             <h2>Hello ${username}</h2>

//             <p>Your verification code is:</p>

//             <h1>${otp}</h1>

//             <p>This code expires in 5 minutes.</p>
//         `

//     });
//     }

// const sendURL= async (email, resetURL) => {

    
//       await transporter.sendMail({

//         from:  `"Ecommerce" <${process.env.EMAIL_USER}>`,

//         to: email,

//     subject: "Reset Password",
//     html: `
//         <h2>Reset your password</h2>

//         <p>Click the link below to reset your password.</p>

//         <a href="${resetUrl}">
//             Reset Password
//         </a>

//         <p>This link expires in 10 minutes.</p>
//     `

//     });
//     }

// module.exports ={ sendOtp,sendURL};


const transporter = require("../config/email.config");

const sendEmail = async ({
  email,
  subject,
  username,
  otp,
  resetUrl,
  type,
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

  await transporter.sendMail({
    from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = sendEmail;



