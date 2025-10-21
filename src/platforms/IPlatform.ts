/**
 * Platform interface that all platform integrations must implement
 */

import { Agent, Task, TaskResult, PlatformType } from '../types';

export interface IPlatform {
  /**
   * Get the platform type
   */
  getPlatformType(): PlatformType;

  /**
   * Initialize the platform connection
   */
  initialize(): Promise<void>;

  /**
   * Execute a task on this platform
   */
  executeTask(task: Task): Promise<TaskResult>;

  /**
   * Verify if a task was executed successfully
   */
  verifyTask(task: Task): Promise<boolean>;

  /**
   * Get available agents for this platform
   */
  getAvailableAgents(): Promise<Agent[]>;

  /**
   * Check if the platform is healthy and ready
   */
  isHealthy(): Promise<boolean>;
}
