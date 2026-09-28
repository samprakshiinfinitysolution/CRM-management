import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';

export default function SalesExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.SALES_EXECUTIVE]}>
      {children}
    </ProtectedRoute>
  );
}
