'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'sonner';

import { SocketProvider } from './SocketProvider';

/**
 * Global Application Providers
 * Powered natively by Redux Toolkit & RTK Query
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <SocketProvider>
        {children}
        <Toaster position="top-right" richColors closeButton duration={5000} />
      </SocketProvider>
    </ReduxProvider>
  );
}
  