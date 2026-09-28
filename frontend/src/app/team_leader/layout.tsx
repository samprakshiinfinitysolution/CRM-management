import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';

export default function TeamLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      {children}
    </ProtectedRoute>
  );
}
