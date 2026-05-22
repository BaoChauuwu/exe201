import mongoose from 'mongoose'
import { notificationSchema, INotification } from './schemas/Notification.schema'

const NotificationModel = mongoose.model<INotification>('Notifications', notificationSchema)
export default NotificationModel
