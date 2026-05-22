import mongoose from 'mongoose'
import { bookingSchema, IBooking } from './schemas/Booking.schema'

const BookingModel = mongoose.model<IBooking>('Bookings', bookingSchema)
export default BookingModel
