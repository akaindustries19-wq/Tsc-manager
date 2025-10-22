/**
 * Base platform implementation with common functionality
 */

import { IPlatform } from './IPlatform';
import { Agent, Task, TaskResult, PlatformType, VerificationStatus } from '../types';

export abstract class BasePlatform implements IPlatform {
  protected config: Record<string, unknown>;
  protected initialized: boolean = false;

  constructor(config: Record<string, unknown> = {}) {
    this.config = config;
  }

  abstract getPlatformType(): PlatformType;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.performInitialization();
    this.initialized = true;
  }

  protected abstract performInitialization(): Promise<void>;

  abstract executeTask(task: Task): Promise<TaskResult>;

  async verifyTask(task: Task): Promise<boolean> {
    if (!task.result) {
      return false;
    }
    return task.result.success && 
           task.result.verificationStatus === VerificationStatus.VERIFIED;
  }

  abstract getAvailableAgents(): Promise<Agent[]>;

  async isHealthy(): Promise<boolean> {
    return this.initialized;
  }

  protected createTaskResult(success: boolean, output?: unknown, error?: string): TaskResult {
    return {
      success,
      output,
      error,
      verificationStatus: success ? VerificationStatus.VERIFIED : VerificationStatus.VERIFICATION_FAILED
    };
  }
}
