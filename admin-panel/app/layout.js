import '@/styles/globals.css';

export const metadata = {
  title: "Admin Panel"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <header className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <nav className="flex space-x-4">
            <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
              Statistics
            </a>
            <a href="/submission-list" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
              Submissions
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
