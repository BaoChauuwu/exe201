import { ObjectId } from 'mongodb'
import mongoose, { Schema, Document } from 'mongoose'

export interface ITripRequest extends Document {
  touristId: ObjectId
  title: string
  description: string
  date: Date
  time: string
  durationHours: number
  budget: number
  city: string
  meetingPoint: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  status: 'open' | 'assigned' | 'completed' | 'cancelled'
  selectedBiddingId?: ObjectId
  created_at: Date
  updated_at: Date
}

const tripRequestSchema = new Schema<ITripRequest>(
  {
    touristId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    durationHours: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true, min: 0 },
    city: { type: String, default: 'Đà Nẵng' },
    meetingPoint: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    status: { 
      type: String, 
      enum: ['open', 'assigned', 'completed', 'cancelled'], 
      default: 'open' 
    },
    selectedBiddingId: { type: Schema.Types.ObjectId, ref: 'Biddings' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'trip_requests'
  }
)

tripRequestSchema.index({ meetingPoint: '2dsphere' })

export default mongoose.models.TripRequests || mongoose.model<ITripRequest>('TripRequests', tripRequestSchema)
