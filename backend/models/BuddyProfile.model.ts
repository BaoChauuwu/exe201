import mongoose from 'mongoose'
import { buddyProfileSchema, IBuddyProfile } from './schemas/BuddyProfile.schema'

const BuddyProfileModel = mongoose.model<IBuddyProfile>('BuddyProfiles', buddyProfileSchema)
export default BuddyProfileModel
