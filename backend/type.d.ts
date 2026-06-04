import { Request, Response } from 'express'
import { IUser } from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
import { IBooking } from './models/schemas/Booking.schema'

declare module 'express' {
  interface Request {
    user?: IUser
    booking?: IBooking & { _id: any }
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}

