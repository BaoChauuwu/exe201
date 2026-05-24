import { Schema } from 'mongoose'

export interface ICategory {
  name: string
  slug: string
  icon: string
  color: string
  bg: string
  border: string
}

export const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    bg: { type: String, required: true },
    border: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'categories'
  }
)
