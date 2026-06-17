import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import databaseService from './services/database.services'
import { hashPassword } from './utils/crypto'
import { UserVerifyStatus } from './constants/enum'

async function seed() {
  await databaseService.connect()
  const db = mongoose.connection.db

  if (!db) {
      throw new Error("Database not connected properly")
  }

  const email = 'baochaudeptrai300@gmail.com'
  
  // 1. Create or Update User
  let user = await databaseService.users.findOne({ email })
  let userId: ObjectId
  
  if (!user) {
    console.log('Creating new user...')
    const result = await databaseService.users.insertOne({
      email,
      password: hashPassword('123456Aa@'), // Default password
      role: 'buddy',
      name: 'Bảo Châu',
      verify: UserVerifyStatus.Verified,
      created_at: new Date(),
      updated_at: new Date()
    } as any)
    userId = result.insertedId
  } else {
    console.log('Updating existing user to buddy...')
    userId = user._id as ObjectId
    await databaseService.users.updateOne(
      { _id: userId },
      { $set: { role: 'buddy', verify: UserVerifyStatus.Verified, location: 'Đà Nẵng' } }
    )
  }

  // 2. Create Buddy Profile
  const buddyProfiles = db.collection('buddy_profiles')
  await buddyProfiles.deleteMany({ userId })
  console.log('Creating BuddyProfile...')
  await buddyProfiles.insertOne({
    userId,
    bio: 'Xin chào, mình là Bảo Châu, một Buddy rất thân thiện, am hiểu văn hóa và ẩm thực Đà Nẵng!',
    tagline: 'Cùng mình khám phá thành phố đáng sống nhất Việt Nam nhé!',
    languages: ['Vietnamese', 'English'],
    specialties: ['Food Tour', 'Photography', 'Culture', 'Beach'],
    city: 'Đà Nẵng',
    isPremium: true,
    rating: 5,
    totalReviews: 12,
    totalCompletedTours: 25,
    hourlyRate: 150000,
    isAvailable: true,
    isApproved: true,
    created_at: new Date(),
    updated_at: new Date()
  })

  // 3. Create Experiences (Trips)
  const experiences = db.collection('experiences')
  await experiences.deleteMany({ buddyId: userId })
  console.log('Creating Experiences...')
  
  const exp1 = await experiences.insertOne({
    buddyId: userId,
    title: 'Food Tour đặc sản Đà Nẵng',
    description: 'Thưởng thức những món ăn đặc sản không thể bỏ lỡ tại Đà Nẵng như Mì Quảng, Bánh tráng cuốn thịt heo, Bánh xèo Bà Dưỡng và chè sầu Liên.',
    category: 'Ẩm thực',
    city: 'Đà Nẵng',
    price: 300000,
    currency: 'VND',
    minHours: 3,
    maxGroupSize: 5,
    images: ['https://upload.wikimedia.org/wikipedia/commons/2/22/M%C3%AC_Qu%E1%BA%A3ng_01.jpg', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A1nh_x%C3%A8o_1.jpg'],
    includedItems: ['Đồ ăn', 'Nước uống', 'Hướng dẫn viên (mình)'],
    avgRating: 4.9,
    totalBookings: 15,
    isActive: true,
    isApproved: true,
    created_at: new Date(),
    updated_at: new Date()
  })

  const exp2 = await experiences.insertOne({
    buddyId: userId,
    title: 'Khám phá thành phố biển & Cầu Rồng',
    description: 'Chuyến đi dạo quanh bãi biển Mỹ Khê tuyệt đẹp, ghé thăm Bán đảo Sơn Trà (Chùa Linh Ứng) và xem Cầu Rồng phun lửa vào cuối tuần.',
    category: 'Khám phá',
    city: 'Đà Nẵng',
    price: 250000,
    currency: 'VND',
    minHours: 4,
    maxGroupSize: 10,
    images: ['https://upload.wikimedia.org/wikipedia/commons/4/4e/Dragon_Bridge_%28C%E1%BA%A7u_R%E1%BB%93ng%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Dragon_bridge%2C_Da_Nang_city%2C_Vietnam.jpg'],
    includedItems: ['Vé tham quan', 'Nước suối'],
    avgRating: 5.0,
    totalBookings: 8,
    isActive: true,
    isApproved: true,
    created_at: new Date(),
    updated_at: new Date()
  })

  // 4. Create Availability Slots (Lịch trình)
  const slots = db.collection('availability_slots')
  await slots.deleteMany({ buddyId: userId })
  console.log('Creating AvailabilitySlots...')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)

  await slots.insertMany([
    {
      buddyId: userId,
      date: tomorrow,
      startTime: '08:00',
      endTime: '12:00',
      status: 'available',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      buddyId: userId,
      date: tomorrow,
      startTime: '14:00',
      endTime: '18:00',
      status: 'available',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      buddyId: userId,
      date: dayAfter,
      startTime: '09:00',
      endTime: '15:00',
      status: 'booked',
      created_at: new Date(),
      updated_at: new Date()
    }
  ])

  console.log('Seeding completed successfully!')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
