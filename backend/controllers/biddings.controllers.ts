import { Request, Response } from 'express'
import BiddingModel from '../models/schemas/Bidding.schema'
import TripRequestModel from '../models/schemas/TripRequest.schema'
import httpStatus from '../constants/httpStatus'
import { ObjectId } from 'mongodb'

// Buddy: Create a bidding for an open trip request
export const createBidding = async (req: Request, res: Response) => {
  try {
    const buddyId = req.decoded_authorization?.user_id
    if (!buddyId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })

    const { tripRequestId, offerPrice, proposal } = req.body

    // Check if trip request exists and is open
    const tripRequest = await TripRequestModel.findById(tripRequestId)
    if (!tripRequest) return res.status(httpStatus.NOT_FOUND).json({ message: 'Trip request not found' })
    if (tripRequest.status !== 'open') return res.status(httpStatus.BAD_REQUEST).json({ message: 'Trip request is no longer open' })

    // Check if buddy already bid
    const existingBidding = await BiddingModel.findOne({
      tripRequestId: new ObjectId(tripRequestId),
      buddyId: new ObjectId(buddyId)
    })
    if (existingBidding) return res.status(httpStatus.BAD_REQUEST).json({ message: 'You have already bid on this request' })

    const newBidding = new BiddingModel({
      tripRequestId: new ObjectId(tripRequestId),
      buddyId: new ObjectId(buddyId),
      offerPrice,
      proposal,
      status: 'pending'
    })

    await newBidding.save()

    return res.status(httpStatus.CREATED).json({
      message: 'Bidding submitted successfully',
      result: newBidding
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}

// Tourist: Accept a bidding
export const acceptBidding = async (req: Request, res: Response) => {
  try {
    const touristId = req.decoded_authorization?.user_id
    if (!touristId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })

    const { biddingId } = req.params

    const bidding = await BiddingModel.findById(biddingId)
    if (!bidding) return res.status(httpStatus.NOT_FOUND).json({ message: 'Bidding not found' })

    const tripRequest = await TripRequestModel.findById(bidding.tripRequestId)
    if (!tripRequest) return res.status(httpStatus.NOT_FOUND).json({ message: 'Trip request not found' })

    // Verify tourist owns the trip request
    if (tripRequest.touristId.toString() !== touristId) {
      return res.status(httpStatus.FORBIDDEN).json({ message: 'You do not own this trip request' })
    }

    if (tripRequest.status !== 'open') {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Trip request is already assigned or closed' })
    }

    // Accept this bidding
    bidding.status = 'accepted'
    bidding.updated_at = new Date()
    await bidding.save()

    // Reject all other biddings for this request
    await BiddingModel.updateMany(
      { tripRequestId: tripRequest._id, _id: { $ne: bidding._id } },
      { $set: { status: 'rejected', updated_at: new Date() } }
    )

    // Update trip request status
    tripRequest.status = 'assigned'
    tripRequest.selectedBiddingId = bidding._id as any
    tripRequest.updated_at = new Date()
    await tripRequest.save()

    return res.status(httpStatus.OK).json({
      message: 'Bidding accepted successfully',
      result: bidding
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}
