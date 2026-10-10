export type TabType = "employees" | "admin_tl";

export interface ChatMessage {
  id: string;
  sender: "user" | "other" | "assistant";
  text: string;
  timestamp: string;
  rawCreatedAt?: string | number | Date;
}

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  activeLeads?: number;
  conversationId?: string;
}

export interface LatestMessageInfo {
  text: string;
  timestamp: string;
  timeMs: number;
}
