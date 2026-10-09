"use client";

import React from "react";
import { AuditLogsView } from "@/components/shared";

export default function AdminAuditLogsPage() {
  return (
    <AuditLogsView
      title="System Audit & Security Logs"
      description="Immutable administrative audit log of all system mutations, role elevations, and user access records."
      breadcrumbs={[
        { label: "Admin Panel", href: "/admin" },
        { label: "Audit Logs" },
      ]}
    />
  );
}
