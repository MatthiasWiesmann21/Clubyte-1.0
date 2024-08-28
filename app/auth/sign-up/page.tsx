"use client";
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignUp() {
  const router = useRouter();
  const [beingSubmitted , setBeingSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleGoogleSignIn = (event: any) => {
    event.preventDefault();
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleSubmit = async (event: any) => {
    try{
    setBeingSubmitted(true)
    event.preventDefault();
    const { name, email, password } = form;

    // Handle your registration logic here, e.g., sending data to your backend
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const jsonObj = await response.json();

    if( jsonObj.error){ 
      toast.error(jsonObj.error);
    }else{
      const response = await signIn("credentials", {
        email, password, redirect: false
      })
      router.replace("/dashboard");
    }
  }catch(error){

  }
  setBeingSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
            Create Your Account
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
              Sign up with Google
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

          <form>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleSubmit}
              type="button"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign{beingSubmitted ? 'ing Up...' : ' Up'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account ?{' '}
            <Link href="/auth/sign-in" className="text-blue-500 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
