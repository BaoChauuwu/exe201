import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import { hashPassword } from './utils/crypto'
import { userSchema, IUser } from './models/schemas/User.schema'
import { UserVerifyStatus } from './constants/enum'

const User = mongoose.models.Users || mongoose.model<IUser>('Users', userSchema)

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    
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
