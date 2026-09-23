import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verona School Lunch Summarizer (Alexa & Vercel)',
  description: 'AI-powered school lunch summaries for Elementary, Middle, and High School, optimized for Alexa Flash Briefings and Alexa Skills.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
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
