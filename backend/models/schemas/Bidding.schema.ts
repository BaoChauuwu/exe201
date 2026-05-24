import { ObjectId } from 'mongodb'
import mongoose, { Schema, Document } from 'mongoose'

export interface IBidding extends Document {
  tripRequestId: ObjectId
  buddyId: ObjectId
  offerPrice: number
  proposal: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: Date
  updated_at: Date
}

const biddingSchema = new Schema<IBidding>(
  {
    tripRequestId: { type: Schema.Types.ObjectId, ref: 'TripRequests', required: true },
    buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    offerPrice: { type: Number, required: true, min: 0 },
    proposal: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected'], 
      default: 'pending' 
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'biddings'
  }
)

const BiddingModel = mongoose.models.Biddings || mongoose.model<IBidding>('Biddings', biddingSchema)
export default BiddingModel as mongoose.Model<IBidding>
