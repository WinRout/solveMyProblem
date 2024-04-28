'use client'

import React, { createContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { data: session } = useSession(); // Get session data


  const fetchUserData = async () => {
    try {
      if (session && session.user) {
          const { email, name } = session.user;
          const response = await fetch(`http://localhost:4010/user-get/${email}`);
          const user = await response.json();
  
          if (JSON.stringify(user) === "{}") {
            const data = { email, name }; 
            await fetch('http://localhost:4010/user-create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const response = await fetch(`http://localhost:4010/user-get/${email}`);
            const user = await response.json();
            setUser(user);
          } else {
            setUser(user); 
          }
          
      }
    } catch (error) {
      console.error('Error fetching user:', error); 
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]); // Trigger fetch on session changes

  return (
    <UserContext.Provider value={{ user, setUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);
