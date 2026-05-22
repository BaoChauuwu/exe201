import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { config } from 'dotenv'
import databaseService from '~/services/database.services'
import User from '~/models/User.model'
import { UserVerifyStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'

config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName
        const avatar = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('No email from Google profile'), undefined)
        }

        // Tìm user đã tồn tại
        let user = await databaseService.users.findOne({ email })

        if (!user) {
          // Tạo user mới từ Google profile
          const user_id = new ObjectId()
          const newUser = new User({
            _id: user_id,
            name: name || '',
            email,
            password: '', // không có password vì đăng nhập Google
            avatar: avatar || '',
            verify: UserVerifyStatus.Verified, // auto verified vì email Google đã verified
            email_verify_token: '',
            date_of_birth: new Date()
          }).toObject()
          await databaseService.users.insertOne(newUser)
          user = await databaseService.users.findOne({ _id: user_id })
        }

        return done(null, user as Express.User)
      } catch (error) {
        return done(error as Error, undefined)
      }
    }
  )
)

passport.serializeUser((user: Express.User, done) => {
  done(null, user)
})

passport.deserializeUser((user: Express.User, done) => {
  done(null, user)
})

export default passport
