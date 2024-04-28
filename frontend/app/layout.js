
import '@/styles/globals.css';

import Providers from "../components/Providers";
import AppBar from "../components/AppBar";

import { UserProvider } from '../contexts/UserContext';

export const metadata = {
  title: "solveMyProblem"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <UserProvider>
            <div className="main">
            </div>
            <main className='app'>
            <AppBar/>
            {children}
            </main>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
