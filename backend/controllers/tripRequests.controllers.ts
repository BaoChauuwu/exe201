import { Request, Response } from 'express'
import TripRequestModel from '../models/schemas/TripRequest.schema'
import BiddingModel from '../models/schemas/Bidding.schema'
import httpStatus from '../constants/httpStatus'
import { ObjectId } from 'mongodb'

// Tourist: Create a trip request
export const createTripRequest = async (req: Request, res: Response) => {
  try {
    const touristId = req.decoded_authorization?.user_id
    if (!touristId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })

    const { title, description, date, time, durationHours, budget, city, meetingPointLng, meetingPointLat } = req.body

    const newRequest = new TripRequestModel({
      touristId: new ObjectId(touristId as string),
      title,
      description,
      date,
      time,
      durationHours,
      budget,
      city,
      meetingPoint: {
        type: 'Point',
        coordinates: [meetingPointLng, meetingPointLat]
      },
      status: 'open'
    })

    await newRequest.save()

    return res.status(httpStatus.CREATED).json({
      message: 'Trip request created successfully',
      result: newRequest
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}

// Buddy: Get all open trip requests
export const getAllOpenRequests = async (req: Request, res: Response) => {
  try {
    const requests = await TripRequestModel.find({ status: 'open' })
      .populate('touristId', 'name avatar')
      .sort({ created_at: -1 })

    return res.status(httpStatus.OK).json({
      message: 'Open requests fetched successfully',
      result: requests
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}

// Tourist: Get their own trip requests
export const getMyTripRequests = async (req: Request, res: Response) => {
  try {
    const touristId = req.decoded_authorization?.user_id
    if (!touristId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })

    const requests = await TripRequestModel.find({ touristId: new ObjectId(touristId as string) })
      .sort({ created_at: -1 })

    return res.status(httpStatus.OK).json({
      message: 'My requests fetched successfully',
      result: requests
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}

// Any: Get request details and its biddings
export const getTripRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const request = await TripRequestModel.findById(id).populate('touristId', 'name avatar')
    if (!request) return res.status(httpStatus.NOT_FOUND).json({ message: 'Trip request not found' })

    const biddings = await BiddingModel.find({ tripRequestId: new ObjectId(id as string) })
      .populate('buddyId', 'name avatar')
      .sort({ created_at: -1 })

    return res.status(httpStatus.OK).json({
      message: 'Trip request details fetched successfully',
      result: {
        request,
        biddings
      }
    })
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message })
  }
}
