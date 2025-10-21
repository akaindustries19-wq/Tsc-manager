/**
 * Task Manager - handles task lifecycle
 */

import { Task, TaskStatus, TaskPriority, PlatformType, TaskResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TaskManager {
  private tasks: Map<string, Task> = new Map();

  createTask(
    description: string,
    instructions: string,
    platform: PlatformType,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Task {
    const task: Task = {
      id: uuidv4(),
      description,
      instructions,
      platform,
      status: TaskStatus.PENDING,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter(task => task.status === status);
  }

  getTasksByPlatform(platform: PlatformType): Task[] {
    return this.getAllTasks().filter(task => task.platform === platform);
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
    }
  }

  assignAgent(taskId: string, agentId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.assignedAgent = agentId;
      task.updatedAt = new Date();
    }
  }

  completeTask(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.updatedAt = new Date();
    }
  }

  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = TaskStatus.FAILED;
      task.result = {
        success: false,
        error
      };
      task.updatedAt = new Date();
    }
  }

  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }
}
