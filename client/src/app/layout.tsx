import '../styles/globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FunMaker | Virtual Sports Betting',
  description: 'Bet on sports and events with virtual points - no real money involved!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">
        <Providers>
          {/* Might add a header component here later */}
          <main className="min-h-screen">
            {children}
          </main>
          {/* Footer will go here eventually */}
        </Providers>
      </body>
    </html>
  );
} 