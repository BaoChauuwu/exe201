import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { IUser } from '../models/schemas/User.schema'
import { IRefreshToken } from '~/models/schemas/RefreshToken.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.dbbh1tu.mongodb.net/`

class DatabaseService {
  private client = new MongoClient(uri)
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')

      // Connect Mongoose to the MongoDB instance
      await mongoose.connect(uri, { dbName: process.env.DB_NAME })
      console.log('Mongoose connected successfully!')
    } catch (error) {
      console.log('Error connecting to database', error)
      throw error
    }
  }

  get users(): Collection<IUser> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }
  get refreshTokens(): Collection<IRefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
