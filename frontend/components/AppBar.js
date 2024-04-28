"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from '../contexts/UserContext';

const AppBar = () => {
    const { data: session } = useSession()
    const router = useRouter();

    const [providers, setProviders] = useState(null);

    const { user } = useUser();
    

    useEffect(() => {
    (async () => {
        const res = await getProviders();
        setProviders(res);
    })();
    }, []);


    useEffect(() => {
        // Logic to execute when the 'user' value changes
        console.log('User data updated:', user); 

        // Replace the console log with your desired actions
    }, [user]); 


    return (
    <nav className='flex-between w-full mb-16 pt-3'>


        <Link href='/' className='flex gap-2 flex-center'>
        <Image
            src='/assets/images/logo.svg'
            alt='logo'
            width={60}
            height={60}
            className='object-contain'
        />
        <p className='logo_text'>solveMyProblem</p>
        </Link>


        <div className='sm:flex hidden'>
        {session?.user ? (
            <div className='flex gap-3 md:gap-5'>


            <Link href='/submission-list' className='black_btn'>
                My Submissions
            </Link>


            <Link href='/create-submission' className='black_btn'>
                Create Submission
            </Link>


            <Link href='/credits' className='black_btn'>
                Add Credits
                <p className='px-2 py-1 ml-3 text-sm bg-primary-orange rounded-2xl text-white'>
                    {user?.credits}
                </p>
            </Link>


            <p className='text-sm py-2'>{session.user.name}</p>


            <Link href='/profile' className='flex flex-col items-center'>
                <Image
                src={session?.user.image}
                width={37}
                height={37}
                className='rounded-full'
                alt='profile'
                />
            </Link>


            <button type='button' onClick={signOut} className='outline_btn'>
                Sign Out
            </button>


            </div>
        ) : (
            <>
            {providers &&
                Object.values(providers).map((provider) => (
                <button
                    type='button'
                    key={provider.name}
                    onClick={() => {
                    signIn(provider.id);
                    }}
                    className='black_btn'
                >
                    Sign in
                </button>
                ))}
            </>
        )}
        </div>
            </nav>
        )

    }

export default AppBar;