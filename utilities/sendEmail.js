

const transporter = require("../config/email.config");

const sendOtp = async (email, username, otp) => {

    
      await transporter.sendMail({

        from:  `"Ecommerce" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "Verify Your Email",

        html: `
            <h2>Hello ${username}</h2>

            <p>Your verification code is:</p>

            <h1>${otp}</h1>

            <p>This code expires in 5 minutes.</p>
        `

    });
    }

const sendURL= async (email, resetUrl) => {

    
      await transporter.sendMail({

        from:  `"Ecommerce" <${process.env.EMAIL_USER}>`,

        to: email,

    subject: "Reset Password",
    html: `
        <h2>Reset your password</h2>

        <p>Click the link below to reset your password.</p>

        <a href="${resetUrl}">
            Reset Password
        </a>

        <p>This link expires in 10 minutes.</p>
    `

    });
    }

module.exports ={ sendOtp,sendURL};






