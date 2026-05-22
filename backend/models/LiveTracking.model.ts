import mongoose from 'mongoose'
import { liveTrackingSchema, ILiveTracking } from './schemas/LiveTracking.schema'

const LiveTrackingModel = mongoose.model<ILiveTracking>('LiveTracking', liveTrackingSchema)
export default LiveTrackingModel
