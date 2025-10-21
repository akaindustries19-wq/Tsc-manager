/**
 * Core types for the AI Manager system
 */

export enum TaskStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum PlatformType {
  WIX = 'WIX',
  SLACK = 'SLACK',
  GITHUB = 'GITHUB',
  BING_COPILOT = 'BING_COPILOT',
  GEMINI = 'GEMINI',
  CLAUDE = 'CLAUDE'
}

export interface TaskResult {
  success: boolean;
  output?: unknown;
  error?: string;
  verificationStatus?: VerificationStatus;
}

export interface Task {
  id: string;
  description: string;
  instructions: string;
  platform: PlatformType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  assignedAgent?: string;
  result?: TaskResult;
  metadata?: Record<string, unknown>;
}

export enum VerificationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED'
}

export interface UserInstruction {
  id: string;
  content: string;
  timestamp: Date;
  userId?: string;
}

export interface Agent {
  id: string;
  name: string;
  platform: PlatformType;
  capabilities: string[];
  isAvailable: boolean;
  currentTasks: string[];
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  reason: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approved?: boolean;
}

export interface PlatformConfig {
  platform: PlatformType;
  apiKey?: string;
  endpoint?: string;
  credentials?: Record<string, string>;
  enabled: boolean;
}
