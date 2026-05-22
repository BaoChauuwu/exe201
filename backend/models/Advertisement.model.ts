import mongoose from 'mongoose'
import { advertisementSchema, IAdvertisement } from './schemas/Advertisement.schema'

const AdvertisementModel = mongoose.model<IAdvertisement>('Advertisements', advertisementSchema)
export default AdvertisementModel
