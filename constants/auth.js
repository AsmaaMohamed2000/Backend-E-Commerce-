const AUTH_ERRORS = {
  USER_ALREADY_EXISTS: "User already exists.",
  USERNAME_ALREADY_EXISTS: "Username already exists.",

  USER_NOT_FOUND: "User not found.",

  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_NOT_VERIFIED: "Please verify your email first.",

  OTP_ALREADY_SENT:
    "OTP already sent. Please check your email.",

  INVALID_OTP:
    "Invalid or expired OTP.",

  OTP_ATTEMPTS_EXCEEDED:
    "Too many invalid attempts. Please request a new OTP.",

  NO_REFRESH_TOKEN:
    "No refresh token provided.",

  INVALID_REFRESH_TOKEN:
    "Invalid or expired refresh token.",

  INVALID_RESET_TOKEN:
    "Invalid or expired reset link.",

  SAME_PASSWORD:
    "New password must be different from the current password."
};

const AUTH_SUCCESS = {
  OTP_SENT:
    "Verification code sent successfully.",

  EMAIL_VERIFIED:
    "Email verified successfully.",

  LOGIN_SUCCESS:
    "Login successful.",

  LOGOUT_SUCCESS:
    "Logged out successfully.",

  PASSWORD_RESET_LINK_SENT:
    "Password reset link sent successfully.",

  PASSWORD_RESET_SUCCESS:
    "Password reset successfully."
};

module.exports = {
  AUTH_ERRORS,
  AUTH_SUCCESS
};