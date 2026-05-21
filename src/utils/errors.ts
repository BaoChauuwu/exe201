import { config } from 'dotenv';
import { ValidationError } from 'express-validator'
import httpStatus from '~/constants/httpStatus';
import { userMessages } from '~/constants/messages';
config()
type ErrorType = Record<string, {
  msg: string
  [key: string]: any
}>
// thuong` thi` no extend Error ma k dung la do khi minh` throw 1 cai loi~ thi` no chỉ nhận message không nhận object ví dụ như status 
export class ErrorWithStatus {
  message: string;
  status: number;
  constructor({message, status} : {message: string, status: number}) {
    this.message = message;
    this.status = status;
  } 
}
// loi validate 422 đó
export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({
    message = userMessages.VALIDATION_ERROR,
    errors
  }: {
    message?: string

    errors: ErrorType
  }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}