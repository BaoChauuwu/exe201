import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'

export const getTouristBookingsValidator = validate(
  checkSchema(
    {
      touristId: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'ID Tourist không hợp lệ.',
                status: httpStatus.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const getBuddyBookingsValidator = validate(
  checkSchema(
    {
      buddyId: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'ID Buddy không hợp lệ.',
                status: httpStatus.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
