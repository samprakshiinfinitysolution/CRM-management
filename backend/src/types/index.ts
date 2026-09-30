import type { Request } from 'express';

export enum UserRole {
  TEAM_LEADER = 'TEAM_LEADER',
  SALES_EXECUTIVE = 'SALES_EXECUTIVE',
}

export enum LeadStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  FOLLOW_UP = 'FOLLOW_UP',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_QUOTATION = 'PROPOSAL_QUOTATION',
  NEGOTIATION = 'NEGOTIATION',
  WON_SOLD = 'WON_SOLD',
  NOT_INTERESTED = 'NOT_INTERESTED',
  NO_RESPONSE = 'NO_RESPONSE',
  WRONG_NUMBER = 'WRONG_NUMBER',
  INVALID = 'INVALID',
  DUPLICATE = 'DUPLICATE',
  ON_HOLD = 'ON_HOLD',
  LOST = 'LOST',
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ExecutiveMetrics {
  totalAssignedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followUpsPending: number;
  followUpsOverdue: number;
  conversionRate: number;
  capacityPercentage: number;
  totalPipelineValue: number;
  workloadStatus: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED';
  statusBreakdown?: Record<string, number>;
}

export interface SalesExecutiveSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
  totalAssignedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followUpsPending: number;
  followUpsOverdue: number;
  conversionRate: number;
  capacityPercentage: number;
  totalPipelineValue: number;
  workloadStatus: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED';
}

export interface SalesExecutiveDetail extends SalesExecutiveSummary {
  statusBreakdown: Record<string, number>;
  leads: any[];
  recentActivities: any[];
  upcomingFollowUps: any[];
}

export interface StagedLeadRow {
  rowNumber: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | null;
  leadSource?: string | null;
  priority: PriorityLevel;
  remarks?: string | null;
  status: 'VALID' | 'DUPLICATE' | 'INVALID';
  validationNote: string;
  duplicateWithLeadCode?: string | null;
  rawRowData?: Record<string, any>;
}

export interface ImportPreviewResult {
  fileName: string;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  headersDetected: string[];
  rows: StagedLeadRow[];
}

export interface CommitImportPayload {
  fileName?: string;
  skipDuplicates?: boolean;
  rows?: StagedLeadRow[];
}

export interface CommitImportResult {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  importedLeadCodes: string[];
}

export type AssignMode = 'EQUAL' | 'CUSTOM' | 'EXPLICIT';

export interface CustomAllocation {
  salesExecutiveId: string;
  count: number;
}

export interface ExplicitAssignment {
  leadId: string;
  salesExecutiveId: string;
}

export interface AssignLeadInput {
  mode: AssignMode;
  leadIds?: string[];
  executiveIds?: string[];
  allocations?: CustomAllocation[];
  assignments?: ExplicitAssignment[];
  reason?: string;
}

export interface LeadAssignmentPair {
  leadId: string;
  salesExecutiveId: string;
}

export interface AssignLeadsResult {
  assignedCount: number;
  mode: AssignMode;
  allocations: {
    salesExecutiveId: string;
    executiveName: string;
    count: number;
  }[];
  assignments: LeadAssignmentPair[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TLDashboardSupervisor {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shiftStatus?: string;
  currentDate: string;
  quickCounts: {
    unassignedCount: number;
    lastBatchInfo: {
      id: string;
      fileName: string;
      totalRows: number;
      importedCount: number;
      createdAt: Date | string;
    } | null;
  };
}

export interface TLDashboardUrgentAttention {
  unassignedCount: number;
  latestBatch: {
    id: string;
    fileName: string;
    totalRows: number;
    importedCount: number;
    createdAt: Date | string;
  } | null;
  activeExecutivesCount: number;
}

export interface TLDashboardPipelineHealth {
  totalPool: {
    value: number;
    formattedValue: string;
    change?: string;
    subtext?: string;
    isPositive?: boolean;
  };
  activeInFlight: {
    value: number;
    formattedValue: string;
    callsToday: number;
    subtext: string;
  };
  wonARR: {
    value: number;
    formattedValue: string;
    wonCount: number;
    conversionRate: number;
    subtext: string;
  };
  slaAdherence: {
    value: number;
    formattedValue: string;
    overdueCount: number;
    alertBadge?: string;
  };
}

export interface TLDashboardFunnelStage {
  key: string;
  label: string;
  count: number;
  pct: number;
  totalValue: number;
  colorClass: string;
  dotBg: string;
}

export interface TLDashboardFunnelBreakdown {
  totalMappedLeads: number;
  stages: TLDashboardFunnelStage[];
}

export interface TLDashboardExecutiveWorkload {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleBadge?: string;
  statusText: string;
  isStatusPositive?: boolean;
  isOnline: boolean;
  wonAmount: number;
  formattedWonAmount: string;
  wonCount: number;
  activeCount: number;
  dueTodayCount: number;
  overdueCount: number;
  slaPercent: number;
  capacityPercent: number;
  capacityWarning: boolean;
  actionType: 'assign' | 'nudge' | 'reassign';
}

export interface TLDashboardCriticalEscalation {
  id: string;
  leadId?: string;
  leadCode: string;
  companyName: string;
  customerName: string;
  stageInfo: string;
  arrAmount: number;
  formattedArrAmount: string;
  overdueHours: number;
  ownerId: string;
  ownerName: string;
  priority: PriorityLevel | string;
  scheduledAt: Date | string;
}

export interface TLDashboardRecentIntake {
  batchId: string;
  batchCode: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
  integrityStatus?: string;
}

export interface TLDashboardMetrics {
  supervisor: TLDashboardSupervisor;
  urgentAttention: TLDashboardUrgentAttention;
  pipelineHealth: TLDashboardPipelineHealth;
  funnelBreakdown: TLDashboardFunnelBreakdown;
  executiveWorkload: TLDashboardExecutiveWorkload[];
  criticalEscalations: TLDashboardCriticalEscalation[];
  recentIntake: TLDashboardRecentIntake | null;
}

