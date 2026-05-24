import mongoose from 'mongoose'
import { categorySchema, ICategory } from './schemas/Category.schema'

const CategoryModel = mongoose.model<ICategory>('Categories', categorySchema)
export default CategoryModel
