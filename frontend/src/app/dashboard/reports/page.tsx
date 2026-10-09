"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { ReportsHubView } from "@/components/shared";

export default function ReportsHubPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <ReportsHubView
        leadReportHref="/dashboard/reports/leads"
        performanceReportHref="/dashboard/reports/performance"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports Hub" },
        ]}
      />
    </ProtectedRoute>
  );
}
