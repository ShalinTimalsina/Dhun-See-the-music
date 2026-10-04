import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Dhun | See the Music',
  description: 'An interactive, visual playground for music theory and composition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-base text-primary antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
