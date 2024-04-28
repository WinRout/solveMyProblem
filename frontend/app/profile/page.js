"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import Image from 'next/image';

const CreatePrompt = () => {
    
    const router = useRouter();

    const { data: session } = useSession();

    const {user} = useUser();



    return (
    <section className='w-full max-w-full flex-start flex-col gap-10'>
        <h1 className='head_text text-left'>
        <span className='blue_gradient'>My Profile</span>
        </h1>

    <div class="flex relative overflow-x-auto glassmorphism">
        <table class="w-full text-sm text-left rtl:text-right">
            <tbody>
                <tr>
                    <th scope="row" class="px-6 py-4 font-medium">
                        Name
                    </th>
                    <td class="px-6 py-4">
                        {session?.user.name}
                    </td>
                </tr>
                <tr>
                    <th scope="row" class="px-6 py-4 font-medium">
                        Email
                    </th>
                    <td class="px-6 py-4">
                        {session?.user.email}
                    </td>
                </tr>
                <tr>
                    <th scope="row" class="px-6 py-4 font-medium">
                        Credits
                    </th>
                    <td class="px-6 py-4">
                        {user?.credits}
                    </td>
                </tr>
            </tbody>
        </table>
        <div className=" place-self-center">
            <Image
                    src={session?.user.image}
                    width={120}
                    height={120}
                    className='rounded-full'
                    alt='profile'
                    />
        </div>
    </div>


    </section>
    );
};

export default CreatePrompt;