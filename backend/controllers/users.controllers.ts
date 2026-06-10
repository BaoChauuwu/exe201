import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import usersService from '../services/users.services'
import {
  EmailVerifyRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  ResetPassWordRequestBody,
  TokenPayload,
  VerifyForgotPasswordRequestBody
} from '../models/requests/User.requests'
import { userMessages } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import httpStatus from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'
import { IUser } from '~/models/schemas/User.schema'

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const user = await databaseService.users.findOne({ _id: new ObjectId(req.params.id as string) }, { projection: { password: 0, forgot_password_token: 0, email_verify_token: 0 } })
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' })
    }
    return res.status(httpStatus.OK).json({ message: 'Success', result: user })
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error })
  }
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const { user } = req
  const user_id = user._id
  const result = await usersService.login(user_id.toString())
  res.status(200).json({
    message: userMessages.LOGIN_SUCCESS,
    result
  })
}
//param giong tim kiem users/123 => id = 123, res.body la du lieu truyen ve client, req.body la du lieu client truyen len server,
// req.query la du lieu truyen len server qua url users?name=abc
//request co 4 thanh phan trong 1 request <dau tien la params, sau la res.body, sau la req.body, cuoi cung la req.query>
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.status(201).json({
    message: userMessages.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  return res.status(200).json({
    message: userMessages.LOGOUT_SUCCESS
  })
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  // Đã verify rồi thì mình sẽ không báo lỗi
  // Trả về status OK và message là email đã được verify rồi
  // Giống kiểu khi mà gửi link qua verify thì verify thành công rồi thì cái trường verify sẽ set thành rỗng
  if (user.email_verify_token === '') {
    return res.status(httpStatus.OK).json({
      message: userMessages.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.status(httpStatus.OK).json({
    message: userMessages.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(httpStatus.OK).json({
      message: userMessages.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await usersService.resendEmailVerify(user_id)
  return res.status(httpStatus.OK).json({
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user as IUser
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.status(httpStatus.OK).json({
    result
  })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  return res.status(httpStatus.OK).json({
    message: userMessages.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPassWordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.status(httpStatus.OK).json({
    message: userMessages.RESET_PASSWORD_SUCCESS
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne(
    { _id: new ObjectId(user_id) },
    { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
  )
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  return res.status(httpStatus.OK).json({
    message: 'Get user profile successfully',
    result: user
  })
}

export const updateMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body
  const updateFields: any = {}
  const allowedFields = ['name', 'bio', 'location', 'website', 'username', 'avatar', 'cover_photo', 'phone', 'nationality', 'role']
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updateFields[key] = body[key]
    }
  }
  if (body.date_of_birth) {
    updateFields.date_of_birth = new Date(body.date_of_birth)
  }

  await databaseService.users.updateOne(
    { _id: new ObjectId(user_id) },
    { $set: { ...updateFields, updated_at: new Date() } }
  )

  const user = await databaseService.users.findOne(
    { _id: new ObjectId(user_id) },
    { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
  )

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }

  return res.status(httpStatus.OK).json({
    message: 'Update profile successfully',
    result: user
  })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  const result = await usersService.refreshToken(user_id, refresh_token)
  return res.status(httpStatus.OK).json({
    message: 'Refresh token successfully',
    result
  })
}

