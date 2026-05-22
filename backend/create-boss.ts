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
    
    const email = 'superadmin@unitravel.com'
    const password = 'SuperAdmin123!'

    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      console.log('Tài khoản đã tồn tại!')
      process.exit(0)
    }

    await new User({
      email,
      password: hashPassword(password),
      role: 'admin',
      name: 'Super Admin',
      isVerified: true,
      verify: UserVerifyStatus.Verified
    }).save()
    
    console.log('--------------------------------')
    console.log('Tạo tài khoản Admin thành công!')
    console.log(`Email: ${email}`)
    console.log(`Mật khẩu: ${password}`)
    console.log('--------------------------------')
    process.exit(0)
  } catch (err) {
    console.error('Lỗi:', err)
    process.exit(1)
  }
}
run()
