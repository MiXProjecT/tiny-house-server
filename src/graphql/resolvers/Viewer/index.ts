import crypto from "crypto"
import { IResolvers } from 'apollo-server-express';
import { Database, User, Viewer } from "../../../lib/types";
import { Google } from '../../../lib/api'
import {LogInArgs} from "./types";


const logInViaGoogle = async (code: string, token: string, db: Database): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);
  if (!user) {
    throw new Error("Google login error");
  }

  // User Display Name
  const userNamesList = user?.names || [];
  const userData = userNamesList[0];
  const userName = userData?.displayName;
  const userId = userData?.metadata?.source?.id;

  // User Avatar
  const userPhotosList = user?.photos || [];
  const userAvatar = userPhotosList[0]?.url;

  // User Email
  const userEmailsList = user?.emailAddresses || [];
  const userEmail = userEmailsList[0]?.value;

  if(!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("Google login error");
  }

  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token
      }
    },
    { returnOriginal: false }
  )

  let viewer = updateRes.value

  if (!viewer) {
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
    })

    viewer = insertResult.ops[0];
  }

  return viewer;
};

const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch(error) {
        throw new Error(`Failed to query Google Auth Url: ${error}`)
      }
    }
  },
  Mutation: {
    logIn: async (_root: undefined, { input }: LogInArgs, { db } : { db: Database}): Promise<Viewer> => {
      try {
        const code = input?.code
        const token = crypto.randomBytes(16).toString("hex")

        const viewer: User | undefined = code ? await logInViaGoogle(code, token, db) : undefined;

        if(!viewer) {
          return { didRequest: true}
        }

        return  {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        }
      } catch (error) {
        throw new Error(`Failed to log in: ${error}`)
      }
    },
    logOut: (): Viewer => {
      try {
        return {
          didRequest: true
        }
      } catch (error) {
        throw new Error(`Failed to logout: ${error}`)
      }

    }
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => { return viewer._id},
    hasWallet: (viewer: Viewer ): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    }
  }
};

export default viewerResolvers;
