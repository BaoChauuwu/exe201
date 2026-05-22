import mongoose from 'mongoose'
import { availabilitySlotSchema, IAvailabilitySlot } from './schemas/AvailabilitySlot.schema'

const AvailabilitySlotModel = mongoose.model<IAvailabilitySlot>('AvailabilitySlots', availabilitySlotSchema)
export default AvailabilitySlotModel
