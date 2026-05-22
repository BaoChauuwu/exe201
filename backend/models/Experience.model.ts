import mongoose from 'mongoose'
import { experienceSchema, IExperience } from './schemas/Experience.schema'

const ExperienceModel = mongoose.model<IExperience>('Experiences', experienceSchema)
export default ExperienceModel
