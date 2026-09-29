'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'slide-up' | 'fade' | 'slide-right';
}

/**
 * Reusable Page Transition Component
 * Provides seamless, hardware-accelerated entry animations during route navigation
 * with WCAG-compliant reduced motion fallbacks.
 */
export default function PageTransition({
  children,
  className,
}: PageTransitionProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'w-full min-h-full flex-1 animate-fade-in',
          className
        )
      )}
    >
      {children}
    </div>
  );
}
