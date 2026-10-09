"use client";

import React from "react";
import { Filter } from "lucide-react";
import { ChartCard, FunnelChart } from "@/components/ui/charts";

export interface FunnelStage {
  stage: string;
  count: number;
  conversionPercentage: number;
}

interface FunnelAnalyticsCardProps {
  stages?: FunnelStage[];
  isLoading?: boolean;
}

export const FunnelAnalyticsCard: React.FC<FunnelAnalyticsCardProps> = ({
  stages = [],
  isLoading = false,
}) => {
  return (
    <ChartCard
      title="Pipeline Conversion Funnel"
      subtitle="Progression and drop-off rate across stages"
      icon={<Filter className="w-4 h-4" />}
      className="h-full"
    >
      <FunnelChart stages={stages} isLoading={isLoading} />
    </ChartCard>
  );
};
