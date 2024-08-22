import { db } from "@/lib/db";
import { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "next-auth";
import { User, Account, Profile } from "next-auth";

type Credentials = {
  email?: string;
  password?: string;
};
type JWT = {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    iat?: number;
    exp?: number;
}
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials : Credentials | undefined, req) {
        console.log("Authorize method called I am route ts NEXT Auth" , req.query , req.body , req.method );

        if (!credentials) {
          throw new Error("No credentials provided");
        }
        const { email, password } = credentials;
        const user = await db.profile.findFirst({
          where: {
            email: {
              equals: email
            },
          },
        });
        if (!user || user.password !== password) {
          return null;
        } else {
          user.id = user.id.toString();

          return user;
        }
      },
    }),
    GoogleProvider({
        clientId: process.env.NEXT_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || '',
      }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      console.log("Sign in successful", { user, account, profile });
      if (profile && account?.provider === "google") {
        // return profile.email_verified && profile.email.endsWith("@example.com")
      }
      // Example: Check if user exists in your database
      const existingUser = await db.profile.findFirst({
        where: {
          email: {
            equals: user.email as string 
          },
        },
      });
      if (!existingUser) {
        // Optionally, you can create the user in your database here
        await db.profile.create({
          data: {
            userId : Date.now().toString(),
            email: user.email as string,
            name: user.name as string,
            imageUrl: user.image as string,
            password : '',
            containerId : ''
            // Add other fields as necessary
          },
        });
      }

      return true; // Return true to indicate success
    }
  },
  pages : {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error : '/auth/error'
  }
};

export default authOptions;