'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface AppChromeProps {
  children: React.ReactNode;
}

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}
      <main className="flex flex-1 flex-col">{children}</main>
      {!isLoginPage && <Footer />}
    </>
  );
}
