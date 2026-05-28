import { UserVerifyStatus } from './../constants/enum'
import RefreshToken from '~/models/RefreshToken.model'
import { TokenType } from '../constants/enum'
import { RegisterRequestBody } from '../models/requests/User.requests'
import User from '~/models/User.model'
import { hashPassword } from '../utils/crypto'
import { signToken } from '../utils/jwt'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { userMessages } from '~/constants/messages'
import databaseService from './database.services'
import { sendVerifyEmail, sendForgotPasswordEmail } from '~/utils/email'
config()
//payload giong 1 object trong do cac thuoc tinh vay a
class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    })
  }
  private signAccessTokenandRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      }).toObject()
    )
    const [access_token, refresh_token] = await this.signAccessTokenandRefreshToken(user_id.toString())
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }).toObject()
    )
    // Gửi email xác thực
    try {
      await sendVerifyEmail(payload.email, payload.name, email_verify_token)
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error)
    }
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenandRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }).toObject()
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: userMessages.LOGOUT_SUCCESS
    }
  }

  async refreshToken(user_id: string, old_refresh_token: string) {
    const [access_token, refresh_token] = await this.signAccessTokenandRefreshToken(user_id)
    await Promise.all([
      databaseService.refreshTokens.deleteOne({ token: old_refresh_token }),
      databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }).toObject()
      )
    ])
    return {
      access_token,
      refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenandRefreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token, updated_at: new Date() } }
    )
    // Gửi lại email xác thực
    if (user) {
      try {
        await sendVerifyEmail(user.email, user.name, email_verify_token)
      } catch (error) {
        console.error('Lỗi khi gửi email xác thực:', error)
      }
    }
    return {
      message: userMessages.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }
  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token,
          updated_at: new Date()
        }
      }
    )
    // Gửi email đặt lại mật khẩu
    if (user) {
      try {
        await sendForgotPasswordEmail(user.email, user.name, forgot_password_token)
      } catch (error) {
        console.error('Lỗi khi gửi email đặt lại mật khẩu:', error)
      }
    }
    return {
      message: userMessages.CREATE_FORGOT_PASSWORD_TOKEN_SUCCESS
    }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password), forgot_password_token: '', updated_at: new Date() } }
    )
  }

  async loginWithGoogle(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenandRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }).toObject()
    )
    return {
      access_token,
      refresh_token
    }
  }
}

const usersService = new UsersService()
export default usersService
