import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Roulette Casino',
  description: 'Full-stack roulette app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}