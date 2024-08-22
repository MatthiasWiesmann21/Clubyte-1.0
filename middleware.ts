import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/sign-in",
    // error: '/AuthPage',
  },
});
export const config = {
  matcher: [
    "/"
  ],
};