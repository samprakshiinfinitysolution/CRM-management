"use client";

import React from "react";
import { DistributionsView } from "@/components/shared";

export default function AdminDistributionsPage() {
  return (
    <DistributionsView
      title="Lead Distribution & Rebalancing Console"
      description="Govern active lead assignments, execute cross-executive workload rebalancing, and recall leads to the intake pool."
      distributeHref="/admin/distributions/new"
      breadcrumbs={[
        { label: "Admin Panel", href: "/admin" },
        { label: "Distributions" },
      ]}
    />
  );
}
