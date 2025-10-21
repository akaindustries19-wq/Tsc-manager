/**
 * Task Delegator - assigns tasks to appropriate agents
 */

import { Task, Agent, TaskStatus } from '../types';
import { IPlatform } from '../platforms/IPlatform';

export class TaskDelegator {
  private platforms: Map<string, IPlatform> = new Map();

  registerPlatform(platform: IPlatform): void {
    this.platforms.set(platform.getPlatformType(), platform);
  }

  async delegateTask(task: Task): Promise<Agent | null> {
    const platform = this.platforms.get(task.platform);
    if (!platform) {
      console.error(`Platform ${task.platform} not found`);
      return null;
    }

    const agents = await platform.getAvailableAgents();
    
    // Find available agent with required capabilities
    const availableAgent = agents.find(agent => 
      agent.isAvailable && agent.currentTasks.length < 5
    );

    if (availableAgent) {
      availableAgent.currentTasks.push(task.id);
      task.assignedAgent = availableAgent.id;
      task.status = TaskStatus.APPROVED;
      return availableAgent;
    }

    return null;
  }

  async executeTask(task: Task): Promise<void> {
    const platform = this.platforms.get(task.platform);
    if (!platform) {
      throw new Error(`Platform ${task.platform} not found`);
    }

    task.status = TaskStatus.IN_PROGRESS;
    
    try {
      const result = await platform.executeTask(task);
      task.result = result;
      
      if (result.success) {
        task.status = TaskStatus.COMPLETED;
      } else {
        task.status = TaskStatus.FAILED;
      }
    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.result = {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async verifyTask(task: Task): Promise<boolean> {
    const platform = this.platforms.get(task.platform);
    if (!platform) {
      return false;
    }

    return await platform.verifyTask(task);
  }

  getPlatform(platformType: string): IPlatform | undefined {
    return this.platforms.get(platformType);
  }

  getAllPlatforms(): IPlatform[] {
    return Array.from(this.platforms.values());
  }
}
