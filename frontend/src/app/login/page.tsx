"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-emerald-600 dark:bg-slate-950 dark:text-emerald-400">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent mx-auto"></div>
        <p className="mt-4 text-sm font-semibold">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
