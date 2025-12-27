import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Gatekeeper - Voice-Powered Call Screening',
  description: 'Intelligent call screening with scam detection and workflow automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
