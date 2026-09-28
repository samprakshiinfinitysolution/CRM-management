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
  variant = 'slide-up',
}: PageTransitionProps) {
  const animationClass =
    variant === 'slide-up'
      ? 'animate-page-enter'
      : variant === 'slide-right'
      ? 'animate-slide-in-right'
      : 'animate-fade-in';

  return (
    <div
      className={twMerge(
        clsx(
          'w-full min-h-full flex-1 will-change-[opacity,transform]',
          animationClass,
          className
        )
      )}
    >
      {children}
    </div>
  );
}
