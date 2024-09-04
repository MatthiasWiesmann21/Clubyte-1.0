"use client"
import Head from "next/head";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { db } from "@/lib/db";

export default function SignIn() {
  const [forgortPasswordModal, setForgotPasswordModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
      console.log("Google sign in response", googleSignInResp);
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setBeingSubmittedGoogle(false);
    }
  };

    
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior
    setBeingSubmitted(true);
    const email = form.email;
    const password = form.password;
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("The response from submission login", response);
    if (response?.error) {
      toast.error(response?.error || "Invalid Credentials");
    } else {
      router.replace("/dashboard");
      toast.success("Login Successful");
    }

    setBeingSubmitted(false);
  };
  const handleForgotPasswordModal = (event: any) => {
    event.preventDefault();
    setForgotPasswordModal(true);
  };

  // Sending email
  const handleForgotPassword = async () => {
    if (!userEmail) {
      toast.error("Enter Email first");
      return;
    } else {
      setSendingEmail(true);

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }), // Ensure userEmail is passed as an object
        });

        const data = await response.json();

        if (response.ok) {
          // Handle success (e.g., show a success message)
          console.log('Password reset email sent:');
          toast.success('Password reset email sent');
          setForgotPasswordModal(false);
          setUserEmail('');
        } else {
          // Handle error response
          toast.error(data.message);
          console.error('Failed to send password reset email:', data.message);
        }
      } catch (error) {
        // Handle fetch error
        console.error('An error occurred:', error);
      } finally {
        setSendingEmail(false); // Reset the sending state
      }
    }
  };

  return (
    <div className="relative">
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
              {beingSubmittedGoogle ? <Image src="/loader-blur.svg" alt="preloader" width={20} height={20} /> : 'Sign in with Google'}
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
              <a href="#" onClick={handleForgotPasswordModal} className="text-sm text-blue-500 hover:underline">
                Forgot your password?
              </a>
            </div>
            <button
              onClick={handleSubmit}
              type="button"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="flex justify-center">
              {beingSubmitted ? 
              <Image src="/loader-blur-white.svg" alt="preloader" width={20} height={20} /> : 
              "Sign In"}  
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

      {/* Forgot password modal */}
      {forgortPasswordModal && (
        <div className="forgot-password-modal absolute bg-gray-300 top-0 left-0 h-screen w-full flex justify-center items-center overflow-hidden">
          <div className="flex flex-col gap-4 h-96 w-96 p-4 flex flex-col justify-center bg-white relative rounded-lg">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setForgotPasswordModal(false)}
                className="bg-red-500 text-white p-2 rounded-lg"
              >
                Close
              </button>
            </div>
            <h2 className="text-center text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-center text-gray-600">Enter your email to reset your password</p>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              placeholder="Enter your email"
            />
            <button
              onClick={handleForgotPassword}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sendingEmail ? 'Sending...' : 'Send Reset Email'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
