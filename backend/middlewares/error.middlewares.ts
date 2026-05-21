import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/utils/errors'

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorWithStatus) {
    return res.status(error.status).json(omit(error, ['status']))
  }
  // mặc định enumberable của error là false nên khi trả về client sẽ không có thuộc tính nào của error,
  // nên ta phải enumberable tất cả các thuộc tính của error để trả về client
  Object.getOwnPropertyNames(error).forEach((key) => {
    Object.defineProperty(error, key, { enumerable: true })
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: error.message,
    errorInfor: omit(error, ['stack'])
  })
}
