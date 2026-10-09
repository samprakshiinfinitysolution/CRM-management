"use client";

import React from "react";
import { ImportsHistoryView } from "@/components/shared";

export default function AdminImportsPage() {
  return (
    <ImportsHistoryView
      title="Excel Lead Import History"
      description="Audit spreadsheet ingestion batches, review validation outcomes, and monitor pool injections."
      uploadHref="/admin/imports/upload"
      batchDetailsHrefPrefix="/admin/imports"
      breadcrumbs={[
        { label: "Admin Panel", href: "/admin" },
        { label: "Imports & Intake" },
      ]}
    />
  );
}
