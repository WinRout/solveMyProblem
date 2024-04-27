"use client"

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react"

const SignInButton = () => {

    const { data: session } = useSession()

    if (session && session.user) {
        return (
            <div className="flex gap-4 items-center">
                <p className="text-sky-600 al">{session.user.name}</p>
                <button className="text-white bg-red-600 h-10 pl-10 pr-10" onClick = {() => signOut()}>
                    Sign Out
                </button>
            </div>
        )
    }

    else {
        return (
            <button className="text-white bg-green-600 h-10 pl-10 pr-10" onClick={() => signIn()}>Sign In</button>
        )
    }

}

export default SignInButton