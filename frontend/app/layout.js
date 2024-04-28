import '@/styles/globals.css';

import Providers from "../components/Providers";
import AppBar from "../components/AppBar";

export const metadata = {
  title: "solveMyProblem"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="main">
          </div>
          <main className='app'>
          <AppBar />
          {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
