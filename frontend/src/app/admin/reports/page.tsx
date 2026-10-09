"use client";

import { ReportsHubView } from "@/components/shared";

export default function AdminReportsPage() {
  return (
    <ReportsHubView
      title="Analytics & Conversion Reports"
      description="Systemic performance, conversion ratios, funnel stage drop-offs, and channel source analytics."
      leadReportHref="/admin/reports/leads"
      performanceReportHref="/admin/reports/performance"
      breadcrumbs={[
        { label: "Admin Panel", href: "/admin" },
        { label: "Reports & Analytics" },
      ]}
    />
  );
}
