"use client";
import Head from "next/head";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
export default function SignIn() {
  const router = useRouter();
  const [beingSubmitted, setBeingSubmitted] = useState(false);
  const [beingSubmittedGoogle, setBeingSubmittedGoogle] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const handleGoogleSignIn = async (event: any) => {
    try {
      setBeingSubmittedGoogle(true);
      event.preventDefault();
      const googleSignInResp = await signIn("google", { callbackUrl: "/dashboard" });
      console.log("Google sign in response" , googleSignInResp );
    } catch (error) {

    }finally{
      setBeingSubmittedGoogle(false);
    }
  };

  const handleSubmit = async (event: any) => {
    setBeingSubmitted(true);
    const email = form.email;
    const password = form.password;
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("The response from submission", response);
    if (response && response.error) {
      // toast.error("Invalid Credentials")
    } else {
      router.replace("/dashboard");
      // toast.success("Login Successful")
    }

    setBeingSubmitted(false);
  };
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>

          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <img
                src="/images/google.png"
                alt="Google"
                className="mr-3 h-5 w-5"
              />
              Sign{beingSubmittedGoogle ? 'ing' : ''} in with Google 
              {beingSubmittedGoogle && <Image src="/loader-blur.svg" alt="preloader" width={20} height={20}/> }
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <form>
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <div className="mb-4 text-right">
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot your password?
              </a>
            </div>
            <button
              onClick={handleSubmit}
              type="button"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="flex justify-center">
              {beingSubmitted ? "Signing In..." : "Sign In"} &nbsp;{beingSubmitted && <Image src="/loader-blur-white.svg" alt="preloader" width={20} height={20}/> }
              </div>
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-blue-500 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
