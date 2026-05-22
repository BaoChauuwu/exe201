import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import experiencesService from '~/services/experiences.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { CreateExperienceRequestBody, UpdateExperienceRequestBody } from '~/models/requests/Experience.requests'
import httpStatus from '~/constants/httpStatus'

export const createExperienceController = async (
  req: Request<ParamsDictionary, any, CreateExperienceRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const files = (req.files ?? []) as Express.Multer.File[]
  const result = await experiencesService.createExperience(user_id, req.body, files)
  return res.status(httpStatus.CREATED).json({
    message: 'Tạo tour thành công',
    result
  })
}

export const updateExperienceController = async (
  req: Request<ParamsDictionary, any, UpdateExperienceRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const id = req.params.id as string
  const files = (req.files ?? []) as Express.Multer.File[]
  const result = await experiencesService.updateExperience(id, user_id, req.body, files)
  return res.status(httpStatus.OK).json({
    message: 'Cập nhật tour thành công',
    result
  })
}

export const getMyExperiencesController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await experiencesService.getMyExperiences(user_id)
  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách tour thành công',
    result
  })
}

export const getExperienceByIdController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string
  const result = await experiencesService.getExperienceById(id)
  return res.status(httpStatus.OK).json({
    message: 'Lấy chi tiết tour thành công',
    result
  })
}

export const getAllExperiencesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await experiencesService.getAllExperiences()
  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách tour công khai thành công',
    result
  })
}
