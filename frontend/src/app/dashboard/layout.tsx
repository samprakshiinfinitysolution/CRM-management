'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.SALES_EXECUTIVE]}>
      <div className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col font-sans relative">
        {/* Top Header */}
        <DashboardHeader onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />

        {/* Sidebar Navigation */}
        <DashboardSidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full pt-6 lg:pl-64 transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
