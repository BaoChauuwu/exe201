import e, { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import { body, checkSchema, ParamSchema } from 'express-validator'
import { validate } from '../utils/validation'
import databaseService from '../services/database.services'
import { ErrorWithStatus } from '~/utils/errors'
import { userMessages } from '~/constants/messages'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import httpStatus from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'
import { trim } from 'lodash'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isString: true,
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: userMessages.PASSWORD_MUST_BE_STRONG
  }
}
const confirm_passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(userMessages.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD)
      }
      return true
    }
  }
}
const forgot_password_tokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: userMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.BAD_REQUEST
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id)
        })
        if (user === null) {
          throw new ErrorWithStatus({
            message: userMessages.USER_NOT_FOUND,
            status: httpStatus.BAD_REQUEST
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: userMessages.FORGOT_PASSWORD_TOKEN_IS_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token as TokenPayload
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: userMessages.FORGOT_PASSWORD_TOKEN_IS_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
        throw error
      }
    }
  }
}
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.EMAIL_IS_REQUIRED,
                status: httpStatus.BAD_REQUEST
              })
            }
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new ErrorWithStatus({
                message: userMessages.USER_NOT_FOUND,
                status: httpStatus.UNAUTHORIZED
              })
            }
            req.user = user
            return true
          }
        },
        trim: true
      },
      password: {
        notEmpty: {
          errorMessage: userMessages.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          }
        },
        isString: true
      }
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: userMessages.NAME_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 3,
            max: 50
          }
        },
        trim: true,
        isString: true
      },
      email: {
        notEmpty: {
          errorMessage: userMessages.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: userMessages.EMAIL_MUST_BE_VALID
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user) {
              throw new Error(userMessages.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: userMessages.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          }
        },
        isString: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: userMessages.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userMessages.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          }
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userMessages.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD)
            }
            return true
          }
        }
      },
      date_of_birth: {
        notEmpty: {
          errorMessage: userMessages.DATE_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: userMessages.DATE_OF_BIRTH_MUST_BE_A_DATE
        }
      },
      role: {
        optional: true,
        isString: true,
        trim: true,
        isIn: {
          options: [['tourist', 'buddy']],
          errorMessage: userMessages.ROLE_MUST_BE_TOURIST_OR_BUDDY
        }
      }
    },
    ['body']
  )
)
// accessTokenValidator thif middleware co' 2 cai
// 1 la` xem thu no co tồn tại hay không
// 2 là verify có đúng hay không
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: userMessages.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: userMessages.ACCESS_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)
export const refreshTokenMiddleware = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: userMessages.REFRESH_TOKEN_NOT_EXISTS,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: userMessages.REFRESH_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: userMessages.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
              status: httpStatus.BAD_REQUEST
            })
          }

          const decoded_email_verify_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
          })
          req.decoded_email_verify_token = decoded_email_verify_token as TokenPayload
        }
      }
    }
  })
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: userMessages.EMAIL_IS_REQUIRED,
              status: httpStatus.BAD_REQUEST
            })
          }
          if (!/\S+@\S+\.\S+/.test(value)) {
            throw new ErrorWithStatus({
              message: userMessages.EMAIL_MUST_BE_VALID,
              status: httpStatus.BAD_REQUEST
            })
          }
          const user = await databaseService.users.findOne({ email: value })
          if (!user) {
            throw new ErrorWithStatus({
              message: userMessages.USER_NOT_FOUND,
              status: httpStatus.BAD_REQUEST
            })
          }
          req.user = user
          return true
        }
      }
    }
  })
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: httpStatus.BAD_REQUEST
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              const { user_id } = decoded_forgot_password_token
              const user = await databaseService.users.findOne({
                _id: new Object(user_id)
              })
              if (user === null) {
                throw new ErrorWithStatus({
                  message: userMessages.USER_NOT_FOUND,
                  status: httpStatus.BAD_REQUEST
                })
              }
              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: userMessages.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              req.decoded_forgot_password_token = decoded_forgot_password_token as TokenPayload
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: userMessages.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirm_passwordSchema,
      forgot_password_token: forgot_password_tokenSchema
    },
    ['body']
  )
)

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.decoded_authorization as TokenPayload
      const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
      
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: userMessages.USER_NOT_FOUND })
      }

      if (!roles.includes(user.role as string)) {
        return res.status(httpStatus.FORBIDDEN).json({ 
          message: 'Access Denied: You do not have permission to perform this action' 
        })
      }

      next()
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
  }
}
