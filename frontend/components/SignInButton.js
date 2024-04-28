import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react"

const SignInButton = () => {

    const { data: session } = useSession()

    const [credits, setCredits] = useState('0')


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

    if (session && session.user) {

        return (
            <div className="flex gap-5">
                <div>
                    <p className="text-sky-600 al">{session.user.name}</p>
                    <p className="text-green-600 al">Credits: {credits}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="text-white bg-red-600 h-10 pl-10 pr-10" onClick = {() => signOut()}>
                        Sign Out
                    </button>
                </div>
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