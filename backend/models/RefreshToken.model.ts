import mongoose from 'mongoose'
import { refreshTokenSchema, IRefreshToken } from './schemas/RefreshToken.schema'

const RefreshTokenModel = mongoose.model<IRefreshToken>('RefreshTokens', refreshTokenSchema)
export default RefreshTokenModel
