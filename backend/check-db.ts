import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import { hashPassword } from './utils/crypto'
import { userSchema, IUser } from './models/schemas/User.schema'

const User = mongoose.models.Users || mongoose.model<IUser>('Users', userSchema)
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.dbbh1tu.mongodb.net/`

async function run() {
  try {
    await mongoose.connect(uri, { dbName: process.env.DB_NAME })
    const user = await User.findOne({ email: 'admin2@unitravel.com' })
    if (!user) {
      console.log('User admin2@unitravel.com not found in DB')
    } else {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        hashedPasswordInDB: user.password,
        expectedHash: hashPassword('123456'),
        doesMatch: user.password === hashPassword('123456')
      })
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
run()
