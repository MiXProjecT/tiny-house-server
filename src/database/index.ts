import { MongoClient } from "mongodb";
import { Database, Listing, User } from "../lib/types";

const {
  DB_USER = '',
  DB_USER_PASSWORD = '',
  DB_CLUSTER = '',
  DB_NAME = ''
} = process.env

const url = `mongodb+srv://${DB_USER}:${DB_USER_PASSWORD}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url , {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const db = client.db('main')

  return {
    bookings: db.collection("bookings"),
    listings: db.collection<Listing>('listings'),
    users: db.collection<User>('users')
  }
}
