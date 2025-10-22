/**
 * AI Manager - Main orchestrator for AI agents across platforms
 */

import { Task, TaskStatus, PlatformType, PlatformConfig } from '../types';
import { TaskManager } from './TaskManager';
import { ApprovalManager } from './ApprovalManager';
import { InstructionParser } from './InstructionParser';
import { TaskDelegator } from './TaskDelegator';
import {
  WixPlatform,
  SlackPlatform,
  GitHubPlatform,
  BingCopilotPlatform,
  GeminiPlatform,
  ClaudePlatform
} from '../platforms';

export class AIManager {
  private taskManager: TaskManager;
  private approvalManager: ApprovalManager;
  private instructionParser: InstructionParser;
  private taskDelegator: TaskDelegator;
  private autoApprove: boolean;

  constructor(config: { autoApprove?: boolean; platforms?: PlatformConfig[] } = {}) {
    this.taskManager = new TaskManager();
    this.approvalManager = new ApprovalManager();
    this.instructionParser = new InstructionParser(this.taskManager);
    this.taskDelegator = new TaskDelegator();
    this.autoApprove = config.autoApprove ?? false;

    this.initializePlatforms(config.platforms);
  }

  private initializePlatforms(platformConfigs?: PlatformConfig[]): void {
    // Initialize all platforms
    const platforms = [
      new WixPlatform(),
      new SlackPlatform(),
      new GitHubPlatform(),
      new BingCopilotPlatform(),
      new GeminiPlatform(),
      new ClaudePlatform()
    ];

    for (const platform of platforms) {
      const config = platformConfigs?.find(
        c => c.platform === platform.getPlatformType()
      );
      
      if (!config || config.enabled !== false) {
        this.taskDelegator.registerPlatform(platform);
        platform.initialize().catch(err => {
          console.error(`Failed to initialize ${platform.getPlatformType()}:`, err);
        });
      }
    }
  }

  /**
   * Process user instruction and create tasks
   */
  async processInstruction(content: string, userId?: string): Promise<Task[]> {
    console.log(`Processing instruction: ${content}`);
    
    const instruction = this.instructionParser.parseInstruction(content, userId);
    const tasks = this.instructionParser.createTasksFromInstruction(instruction);
    
    console.log(`Created ${tasks.length} task(s) from instruction`);
    
    for (const task of tasks) {
      await this.processTask(task);
    }
    
    return tasks;
  }

  /**
   * Process a single task through the workflow
   */
  private async processTask(task: Task): Promise<void> {
    try {
      // Step 1: Request approval (if not auto-approve)
      if (!this.autoApprove) {
        console.log(`Requesting approval for task: ${task.id}`);
        const approved = await this.approvalManager.requestApproval(
          task,
          `Approve execution of: ${task.description}`
        );
        
        if (!approved) {
          task.status = TaskStatus.REJECTED;
          console.log(`Task ${task.id} was rejected`);
          return;
        }
      }

      // Step 2: Delegate to agent
      console.log(`Delegating task: ${task.id}`);
      const agent = await this.taskDelegator.delegateTask(task);
      
      if (!agent) {
        throw new Error('No available agent found for task');
      }
      
      console.log(`Task ${task.id} assigned to agent: ${agent.id}`);

      // Step 3: Execute task
      console.log(`Executing task: ${task.id}`);
      await this.taskDelegator.executeTask(task);
      
      // Step 4: Verify task completion
      console.log(`Verifying task: ${task.id}`);
      const verified = await this.taskDelegator.verifyTask(task);
      
      if (verified) {
        console.log(`Task ${task.id} completed and verified successfully`);
      } else {
        console.log(`Task ${task.id} verification failed`);
      }
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
      this.taskManager.failTask(task.id, (error as Error).message);
    }
  }

  /**
   * Approve a pending approval request
   */
  approveTask(approvalRequestId: string): void {
    this.approvalManager.approveRequest(approvalRequestId);
  }

  /**
   * Reject a pending approval request
   */
  rejectTask(approvalRequestId: string): void {
    this.approvalManager.rejectRequest(approvalRequestId);
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return this.taskManager.getAllTasks();
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.taskManager.getTasksByStatus(status);
  }

  /**
   * Get tasks by platform
   */
  getTasksByPlatform(platform: PlatformType): Task[] {
    return this.taskManager.getTasksByPlatform(platform);
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals() {
    return this.approvalManager.getPendingApprovals();
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.taskManager.getTask(taskId);
  }

  /**
   * Get all available platforms
   */
  getPlatforms() {
    return this.taskDelegator.getAllPlatforms();
  }
}
