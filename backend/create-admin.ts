import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import { hashPassword } from './utils/crypto'
import { UserVerifyStatus } from './constants/enum'
import User from './models/User.model'

async function run() {
  try {
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.dbbh1tu.mongodb.net/`
    await mongoose.connect(uri, { dbName: process.env.DB_NAME })

    // Kiểm tra xem đã có admin2 chưa
    const existingAdmin = await User.findOne({ email: 'admin2@unitravel.com' })
    if (existingAdmin) {
      console.log('Tài khoản admin2@unitravel.com đã tồn tại!')
      process.exit(0)
    }

    await new User({
      email: 'admin2@unitravel.com',
      password: hashPassword('123456'),
      role: 'admin',
      name: 'Admin 2',
      isVerified: true,
      verify: UserVerifyStatus.Verified
    }).save()

    console.log('--------------------------------')
    console.log('Tạo tài khoản Admin thành công!')
    console.log('Email: admin2@unitravel.com')
    console.log('Mật khẩu: 123456')
    console.log('--------------------------------')
    process.exit(0)
  } catch (err) {
    console.error('Lỗi:', err)
    process.exit(1)
  }
}
run()
