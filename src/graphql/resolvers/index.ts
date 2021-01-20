import merge from 'lodash.merge'
import viewerResolvers from "./Viewer";
import userResolvers from "./User";

const resolvers = merge(viewerResolvers, userResolvers);

export default resolvers;
