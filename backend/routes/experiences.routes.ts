import { Router, Request, Response, NextFunction } from 'express'
import { accessTokenValidator, requireRole } from '~/middlewares/users.middlewares'
import { multerUpload, createExperienceValidator, updateExperienceValidator } from '~/middlewares/experiences.middlewares'
import {
  createExperienceController,
  updateExperienceController,
  getMyExperiencesController,
  getExperienceByIdController,
  getAllExperiencesController,
  getExperiencesByBuddyIdController
} from '~/controllers/experiences.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const experiencesRouter = Router()

// POST /experiences – Tạo tour
experiencesRouter.post(
  '/',
  accessTokenValidator,
  requireRole(['buddy']),
  (req: Request, res: Response, next: NextFunction) => {
    multerUpload(req, res, (err) => {
      if (err) return next(err)
      next()
    })
  },
  createExperienceValidator,
  wrapRequestHandler(createExperienceController)
)

// PUT /experiences/:id – Cập nhật tour
experiencesRouter.put(
  '/:id',
  accessTokenValidator,
  requireRole(['buddy']),
  (req: Request, res: Response, next: NextFunction) => {
    multerUpload(req, res, (err) => {
      if (err) return next(err)
      next()
    })
  },
  updateExperienceValidator,
  wrapRequestHandler(updateExperienceController)
)

// GET /experiences/my – Danh sách tour của mình
experiencesRouter.get(
  '/my',
  accessTokenValidator,
  requireRole(['buddy']),
  wrapRequestHandler(getMyExperiencesController)
)

// GET /experiences – Danh sách tour công khai (Public)
experiencesRouter.get('/', wrapRequestHandler(getAllExperiencesController))

// GET /experiences/buddy/:buddyId – Danh sách tour của 1 buddy cụ thể (Public)
experiencesRouter.get('/buddy/:buddyId', wrapRequestHandler(getExperiencesByBuddyIdController))

// GET /experiences/:id – Chi tiết 1 tour (Public)
experiencesRouter.get('/:id', wrapRequestHandler(getExperienceByIdController))

export default experiencesRouter
