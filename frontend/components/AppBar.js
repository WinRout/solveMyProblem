"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

const AppBar = () => {
    const { data: session } = useSession()

    const [providers, setProviders] = useState(null);
    const [credits, setCredits] = useState('0')

    useEffect(() => {
    (async () => {
        const res = await getProviders();
        setProviders(res);
    })();
    }, []);

    useEffect(() => {
        const fetchCredits = async () => {
          try {
            if (session && session.user) {
                const { email, name } = session.user;
                console.log(email)
                const response = await fetch(`http://localhost:4010/user-get/${email}`);
                const user = await response.json();
        
                if (JSON.stringify(user) === "{}") {
                  const data = { email, name }; 
                  await fetch('http://localhost:4010/user-create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  setCredits('0'); // User created, set initial credits
                } else {
                  setCredits(user.credits); 
                }
            }
          } catch (error) {
            console.error('Error fetching credits:', error); 
            // Handle the error appropriately (e.g., display an error message)
          }
        };
        // Only fetch credits if you have an email
        fetchCredits();
        }, [session]); // Trigger useEffect when session changes 

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

        {/* Desktop Navigation */}
        <div className='sm:flex hidden'>
        {session?.user ? (
            <div className='flex gap-3 md:gap-5'>

            <Link href='/credits' className='black_btn'>
                My Submissions
            </Link>

            <Link href='/credits' className='black_btn'>
                Create Submission
            </Link>

            <Link href='/credits' className='black_btn'>
                Add Credits
                <p className='px-2 py-1 ml-3 text-sm bg-primary-orange rounded-2xl text-white'>
                    {credits}
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