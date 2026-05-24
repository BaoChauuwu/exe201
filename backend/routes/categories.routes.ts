import { Router } from 'express'
import categoriesService from '~/services/categories.services'
import { wrapRequestHandler } from '~/utils/handlers'

const categoriesRouter = Router()

// GET /categories – Lấy danh sách danh mục lưu trong DB
categoriesRouter.get(
  '/',
  wrapRequestHandler(async (req, res) => {
    const result = await categoriesService.getAllCategories()
    return res.status(200).json({
      message: 'Lấy danh sách danh mục thành công',
      result
    })
  })
)

export default categoriesRouter
