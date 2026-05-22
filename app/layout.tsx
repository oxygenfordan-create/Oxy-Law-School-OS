import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Law School OS',
  description: 'Offline-first law study environment',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
