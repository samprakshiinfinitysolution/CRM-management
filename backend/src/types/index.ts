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

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
