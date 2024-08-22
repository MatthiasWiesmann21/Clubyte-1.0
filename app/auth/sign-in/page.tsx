// "use client";
// import { useEffect } from "react";
// import { signIn, useSession } from "next-auth/react";

// export default function Page() {
//   const hasRefreshedKey = "hasRefreshed";
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     const hasRefreshed = sessionStorage.getItem(hasRefreshedKey);

//     if (!hasRefreshed) {
//       sessionStorage.setItem(hasRefreshedKey, "true");
//       setTimeout(() => {
//         if (typeof window === "undefined") 
//         {
//           return ;
//         }
//         if(window){
//           // window.location.href = window.location.href;
//         }
//       }, 100000); // Adding a slight delay to ensure state is updated
//     } else {
//       sessionStorage.removeItem(hasRefreshedKey);
//     }
//   }, []);

//   // return <SignIn />;
//   if (status === "loading") {
//     return <div>Loading...</div>; // Or any loading spinner/message
//   }

//   if (session) {
//     return <div>Welcome back, {session.user?.name || "User"}!</div>;
//   }

//   return (
//     <div>
//       <h1>Please sign in</h1>
//       <button onClick={() => signIn("google")}>Sign in with Google</button>
//       {/* Add other sign-in options if necessary */}
//     </div>
//   );
// }
"use client"
import Head from 'next/head';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const handleGoogleSignIn = (event : any ) => {
    event.preventDefault();
    signIn('google', { callbackUrl: '/' });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Replace with your credentials sign-in logic
    signIn('credentials', { email, password, callbackUrl: '/' });
  };
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
            Welcome Back
          </h2>

          <div className="mb-6">
            <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              <img
                src="/images/google.png" 
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              Sign in with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form  onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                 name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <div className="mb-4 text-right">
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot your password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-blue-500 hover:underline font-medium">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
