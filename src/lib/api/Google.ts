import {google, people_v1} from "googleapis";

type PeopleData = {
  user: people_v1.Schema$Person

}

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
)

const googleScope = auth.generateAuthUrl({
  access_type: "online",
  scope: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]
})

const Google = {
  authUrl: googleScope,
  logIn: async (code: string):Promise<PeopleData> => {
    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    const { data } = await google.people({version: "v1", auth: auth}).people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    })

    return { user: data }
  }
}

export default Google;
