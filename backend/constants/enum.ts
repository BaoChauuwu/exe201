export enum UserVerifyStatus {
    Unverified = 0, // Chưa xác thực email, mặc định khi đăng ký
    Verified = 1, // Đã xác thực email
    Banned = 2 // Bị khóa tài khoản
}

export enum TokenType {
  AccessToken, 
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}