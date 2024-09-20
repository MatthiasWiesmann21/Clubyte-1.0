"use client";
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ModeToggle } from '@/components/mode-toggle';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppSVG from '@/components/appsvg';

export default function SignUp() {
  const router = useRouter();
  const [beingSubmitted, setBeingSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  

  const handleGoogleSignIn = (event: any) => {
    event.preventDefault();
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const validatePasswordStrength = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      const { name, email, password, confirmPassword } = form;

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }

      setBeingSubmitted(true)

      // Handle your registration logic here, e.g., sending data to your backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const jsonObj = await response.json();

      if (jsonObj.error) {
        toast.error(jsonObj.error);
      } else {
        const response = await signIn("credentials", {
          email, password, redirect: false
        })
        router.replace("/dashboard");
      }
    } catch (error) {

    }
    setBeingSubmitted(false);
  };

  const renderRight = () => {
    return (
      <AppSVG svg="signUp" customclass="w-full h-full" />
    )
  }
  
  const renderGoogleIcon = () => {
    return (
      <div className="flex items-center justify-center hover:bg-gray-100 dark:hover:text-black rounded-md px-12 py-3 border border-gray-300 transition ease-in-out duration-200">
        <Image src="/images/google.png" alt="Google" width={24} height={24} />
        &nbsp; Sign in with Google</div>
    );
  };

  return (
    <>
      <div className="w-full flex flex-col md:flex-row justify-center items-center h-screen">
        <div className="w-full md:w-2/3 lg:w-2/3 xl:w-2/3 px-4">
          <form className="w-[80%] sm:w-[70%] md:w-[70%] mx-auto login-form flex flex-col max-w-xl p-4">
            <div className="form-header mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-black dark:text-white">Sign Up</h2>
            </div>
            <div className="mb-2">
              <label className="mb-2 block text-lg md:text-xl font-medium text-black dark:text-white" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 dark:text-gray-200 focus:border-gray-300 focus:outline-none text-lg"
                placeholder="Enter your name"
                autoComplete='off'
                autoFocus
              />
            </div>
            <div className="mb-2">
              <label className="mb-2 block text-lg md:text-xl font-medium text-black dark:text-white" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 dark:text-gray-200 focus:border-gray-300 focus:outline-none text-lg"
                placeholder="Enter your email"
                autoComplete='off'
              />
            </div>
            <div className="mb-2">
              <label className="mb-2 block text-lg md:text-xl font-medium text-black dark:text-white" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 dark:text-gray-200 focus:border-gray-300 focus:outline-none text-lg"
                  placeholder="Enter your password"
                />
                <span className='absolute right-3 top-3 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-lg md:text-xl font-medium text-black dark:text-white" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 dark:text-gray-200 focus:border-gray-300 focus:outline-none text-lg"
                  placeholder="Confirm your password"
                />
                <span className='absolute right-3 top-3 cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff /> : <Eye />}</span>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              type="button"
              className="w-full bg-[#EC2089] text-white px-4 h-14 rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="flex justify-center text-lg md:text-xl">
                {beingSubmitted ? <Image src="/loader-blur-white.svg" alt="preloader" width={20} height={20} />  : 'Sign Up'}
              </div>
            </Button>
            <div className="flex justify-center mt-2 text-lg">
              <p>Already have an account? <span className="text-pink-500">
                <Link href="/auth/sign-in" className="hover:underline">
                  Sign In
                </Link>
              </span></p>
            </div>
            <div className="login-with relative mt-4 mb-4">
              <p className="text-center text-lg">Or sign up with</p>
            </div>
            <div className="button-boxes flex w-full justify-center gap-2">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleGoogleSignIn}
              >
                {renderGoogleIcon()}
              </div>
            </div>
          </form>
          <div className="mt-4 flex justify-center">
            <ModeToggle />
          </div>
        </div>
        <div className="hidden md:flex md:w-1/2 lg:w-1/2 xl:w-1/2 justify-center items-center">
          {renderRight()}
        </div>
      </div>
    </>
  );
}