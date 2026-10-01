'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/utils';
import { decodeJwt } from '@/lib/jwt';
import { Loader2 } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    const decoded = decodeJwt(token);
    if (!decoded) {
      router.replace('/login');
      return;
    }

    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-crm-canvas">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-(--crm-brand-primary)" />
        <span className="text-sm font-medium text-crm-muted">
          Loading LeadFlow CRM...
        </span>
      </div>
    </div>
  );
}
