"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { ImportsHistoryView } from "@/components/shared";

export default function ImportsHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <ImportsHistoryView
        uploadHref="/dashboard/imports/upload"
        batchDetailsHrefPrefix="/dashboard/imports/batches"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Excel Imports" },
        ]}
      />
    </ProtectedRoute>
  );
}
