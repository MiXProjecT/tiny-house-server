import { IResolvers } from 'apollo-server-express';

const viewerResolvers: IResolvers = {
  Query: {
    authUrl: () => {
      return "Query.authUrl";
    }
  },
  Mutation: {
    logIn: () => {
      return "Mutation.logIn"
    },
    logOut: () => {
      return "Mutation.logOut"
    }
  }
};

export default viewerResolvers;
