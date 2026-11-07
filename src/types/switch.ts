export type PlatformType = 'slack' | 'discord' | 'teams' | 'telegram' | 'mattermost';

export interface AgentTeammate {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
  badgeColor: string;
  harness: 'Claude Code' | 'Gemini SDK' | 'LangChain' | 'OpenAI Codex' | 'MCP Server';
  model: string;
  status: 'active' | 'busy' | 'idle';
  tools: string[];
  description: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isAgent: boolean;
  agentHandle?: string;
  timestamp: string;
  content: string;
  platform: PlatformType;
  channelId: string;
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
  cardData?: {
    type: 'incident' | 'code_review' | 'trust_alert' | 'metric';
    title: string;
    status: 'investigating' | 'resolved' | 'warning' | 'info';
    details: Array<{ label: string; value: string }>;
    actionButtons?: string[];
  };
  trustScan?: {
    hasPii: boolean;
    hasSecret: boolean;
    hasPromptInjection: boolean;
    redactedCount: number;
  };
}

export interface SwitchChannel {
  id: string;
  name: string;
  topic: string;
  icon: string;
  unreadCount: number;
  assignedAgents: string[];
}

export interface PIIFinding {
  type: 'API_KEY' | 'EMAIL' | 'CREDIT_CARD' | 'PHONE' | 'INJECTION_PATTERN' | 'BEARER_TOKEN';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  match: string;
  description: string;
}

export interface ScanResult {
  hasPii: boolean;
  hasSecret: boolean;
  hasPromptInjection: boolean;
  redactedText: string;
  findings: PIIFinding[];
}
