"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


interface ResetFormState {
    password: string;
    confirmPassword: string;
    token: string;
}


const Page = () => {
    const router = useParams();
    const route = useRouter();
    const token = Array.isArray(router?.token) ? router.token[0] : router?.token || '';
    const [resetForm, setResetForm] = useState<ResetFormState>({
        password: '',
        confirmPassword: '',
        token: '',
    });

    useEffect(() => {
        if (token) {
            console.log('Token:', token);
            setResetForm(prevForm => ({
                ...prevForm,
                token: token
            }));
        }
    }, [token]);

    const handleResetPassword = async() => {
        try{
            // console.log('Reset password form:', resetForm);
            const {password, confirmPassword, token} = resetForm;
            if(!password || !confirmPassword){
                toast.error('Please provide all fields');
                return;
            }
            if(password !== confirmPassword){
                toast.error('Passwords do not match');
                return;
            }
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({password, confirmPassword, token}),
            })
            const blob = await response.json()
            // console.log('reset password response', blob);
            if(blob.error){
                toast.error(blob.error);
            }else{
                toast.success('Password reset successfully');
                route.push('/auth/sign-in');
            }
        }
        catch(error){
            console.log(error);
        }
    };

    return (
        <section className="bg-gray-300">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full p-6 bg-white rounded-lg shadow md:mt-0 sm:max-w-md dark:border-gray-700 sm:p-8">
                    <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Change Password
                    </h2>
                    <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" action="#">
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                New Password
                            </label>
                            <input  
                                onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} 
                                type="password" 
                                name="password" 
                                id="password" 
                                placeholder="••••••••" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900">
                                Confirm password
                            </label>
                            <input 
                                onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })} 
                                type="password" 
                                name="confirm-password" 
                                id="confirm-password" 
                                placeholder="••••••••" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                required 
                            />
                        </div>
                        <button 
                            onClick={handleResetPassword}
                            type="button" 
                            className="w-full text-white bg-[#7F45ED] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Reset password
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Page;
