import mongoose from 'mongoose'
import { userSchema, IUser } from './schemas/User.schema'

const UserModel = mongoose.model<IUser>('Users', userSchema)
export default UserModel
