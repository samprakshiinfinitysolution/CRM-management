import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { TLBottomNav, TLHeader } from "@/components/team_leader";

export default function TeamLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col font-sans relative">
        {/* Top App Header */}
        <TLHeader />

        {/* Floating Left Slider Dock Navigation */}
        <TLBottomNav />

        {/* Main Content Area with offset for header and floating slider */}
        <div className="flex-1 w-full pt-16 md:pl-24 transition-all duration-300">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
