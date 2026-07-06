const otpTemplate = (username, otp) => {

    return `

    <div style="font-family:Arial,sans-serif">

        <h2>Email Verification</h2>

        <p>Hello ${username},</p>

        <p>Your verification code is:</p>

        <h1
        style="
        letter-spacing:5px;
        color:#0d6efd;
        ">
        ${otp}
        </h1>

        <p>This code will expire in 5 minutes.</p>

        <p>If you didn't request this code, ignore this email.</p>

    </div>

    `;

};

module.exports = {

    otpTemplate

};