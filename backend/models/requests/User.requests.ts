import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'
// Tai sao lai co file này vì khi mình gọi ở controller ví dụ như req.body nó sẽ trả kiểu dữ liệu là any
// Mình sẽ khai báo kiểu dữ liệu cho req.body để khi mình gọi req.body.name nó sẽ biết được name là string
// Nếu mình không khai báo kiểu dữ liệu cho req.body thì khi mình gọi req.body.name nó sẽ trả về lỗi vì nó không biết name là gì
export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  date_of_birth: string
  confirm_password: string
  role?: string
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface EmailVerifyRequestBody {
  email_verify_token: string
}
export interface LoginRequestBody {
  email: string
  password: string
}

export interface ForgotPasswordRequestBody {
  email: string
}
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

export interface ResetPassWordRequestBody {
  password: string
  confirm_password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
