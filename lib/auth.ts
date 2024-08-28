import { db } from "@/lib/db";
import { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
(<any>global).logger = console.log;

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
      credentials: {
      },
      async authorize(credentials: Credentials | undefined, req) {
        (<any>global).logger("CredentialsProvider called in route ts NEXT Auth" , credentials)
        console.log("Authorize method called in route ts NEXT Auth", req.query, req.body, req.method);

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

        if (!user) {
          throw new Error("No user found with the provided email");
        }

        // Check the hashed password
        const isValidPassword = bcrypt.compareSync(password || '', user.password || '');
        console.log("Password is now validated", isValidPassword );
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }
        console.log("Returning user as of auth ", user );

        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error: '/auth/error'
  }
};

export default authOptions;
