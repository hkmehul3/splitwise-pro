import './globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from '@/components/session-provider';

export const metadata: Metadata = { title: 'Splitwise Pro', description: 'Production-ready expense sharing platform with auth, database, settlements and analytics.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SessionProvider>{children}</SessionProvider></body></html>;
}
