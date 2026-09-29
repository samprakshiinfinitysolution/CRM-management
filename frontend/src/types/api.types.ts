export enum UserRole {
  TEAM_LEADER = "TEAM_LEADER",
  SALES_EXECUTIVE = "SALES_EXECUTIVE",
}

export enum PriorityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum LeadStatus {
  NEW = "NEW",
  ASSIGNED = "ASSIGNED",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  FOLLOW_UP = "FOLLOW_UP",
  QUALIFIED = "QUALIFIED",
  PROPOSAL_QUOTATION = "PROPOSAL_QUOTATION",
  NEGOTIATION = "NEGOTIATION",
  WON_SOLD = "WON_SOLD",
  NOT_INTERESTED = "NOT_INTERESTED",
  NO_RESPONSE = "NO_RESPONSE",
  WRONG_NUMBER = "WRONG_NUMBER",
  INVALID = "INVALID",
  DUPLICATE = "DUPLICATE",
  ON_HOLD = "ON_HOLD",
  LOST = "LOST",
}

export enum FollowUpStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
}

// -------------------------------------------------------------
// Standard API Envelope
// -------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message?: string;
    details?: unknown;
  };
}

// -------------------------------------------------------------
// Auth Types
// -------------------------------------------------------------
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
}

export type AuthResponse = ApiResponse<AuthResponseData>;

// -------------------------------------------------------------
// Lead & CRM Types
// -------------------------------------------------------------
export interface LeadItem {
  id: string;
  leadCode: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | string | null;
  leadSource?: string | null;
  source?: string | null;
  priority: PriorityLevel;
  status: LeadStatus;
  notes?: string | null;
  assignedToUserId?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedByUserId?: string | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilterParams {
  status?: LeadStatus | string;
  source?: string;
  search?: string;
  city?: string;
  sortBy?: string;
  assignedToUserId?: string;
  unassignedOnly?: boolean;
  page?: number;
  limit?: number;
}

// -------------------------------------------------------------
// Lead Distribution Types
// -------------------------------------------------------------
export type DistributionMode = 'EQUAL_SPLIT' | 'FIXED_QUOTA' | 'WEIGHTED_TIER';

export interface DistributionPayload {
  mode: DistributionMode;
  targetExecutiveIds: string[];
  quotas?: Record<string, number>; // Used for FIXED_QUOTA
  leadIds?: string[]; // Optional specific leads, otherwise unassigned pool is used
  maxLeads?: number;
}

export interface DistributionResult {
  distributedCount: number;
  allocations: {
    executiveId: string;
    executiveName: string;
    allocatedCount: number;
  }[];
}

// -------------------------------------------------------------
// Executive Workload & Analytics Types
// -------------------------------------------------------------
export interface ExecutiveWorkloadItem {
  id: string;
  name: string;
  email: string;
  activeLeads: number;
  conversionRate: number;
  capacityPercentage: number;
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED';
}

export interface PipelineMetrics {
  totalLeads: number;
  unassignedCount: number;
  assignedCount: number;
  convertedCount: number;
  conversionRate: number;
  pipelineValue: number;
}

export interface CriticalEscalationItem {
  id: string;
  leadId: string;
  leadCode: string;
  customerName: string;
  reason: string;
  assignedToName: string;
  elapsedHours: number;
  severity: 'HIGH' | 'CRITICAL';
}

export interface SalesExecutiveSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
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

export interface SalesExecutiveFollowUpItem {
  id: string;
  leadId: string;
  scheduledAt: string;
  type: string;
  status: FollowUpStatus;
  notes?: string | null;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
    mobile: string;
    status: LeadStatus;
  } | null;
}

export interface SalesExecutiveActivityItem {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
  } | null;
}

export interface SalesExecutiveDetail extends SalesExecutiveSummary {
  statusBreakdown: Record<string, number>;
  leads: LeadItem[];
  upcomingFollowUps: SalesExecutiveFollowUpItem[];
  recentActivities: SalesExecutiveActivityItem[];
}

// -------------------------------------------------------------
// Report & Analytics Types
// -------------------------------------------------------------
export interface ReportKPIsData {
  totalIntake: number;
  intakeChangePercent: number;
  conversionRate: number;
  avgCycleTimeHours: number;
  slaComplianceRate: number;
  wonDealsCount: number;
  pipelineValue?: number;
}

export interface ReportFunnelStage {
  stage: string;
  count: number;
  conversionPercentage: number;
}

export interface ReportChannelSource {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface ReportExecutiveScorecard {
  id: string;
  name: string;
  email: string;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseHours: number;
  slaBreaches: number;
}

export interface ReportSummaryData {
  kpis: ReportKPIsData;
  funnel: ReportFunnelStage[];
  sources?: ReportChannelSource[];
  executives: ReportExecutiveScorecard[];
}

export interface ReportQueryParams {
  timeRange?: string;
  executiveId?: string;
  source?: string;
}

// -------------------------------------------------------------
// Sheet Import / Ingestion Types
// -------------------------------------------------------------
export interface StagedLeadRow {
  id?: string;
  rowNumber?: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement?: string | null;
  productService?: string | null;
  budget?: string | number | null;
  leadSource?: string | null;
  source?: string | null;
  priority?: PriorityLevel | string;
  remarks?: string | null;
  status: 'VALID' | 'DUPLICATE' | 'INVALID';
  validationNote?: string;
  duplicateWithLeadCode?: string | null;
  rawRowData?: Record<string, unknown>;
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
  rows: StagedLeadRow[];
}

export interface CommitImportResult {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

