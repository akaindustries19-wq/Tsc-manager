/**
 * Instruction Parser - parses user instructions and creates tasks
 */

import { UserInstruction, Task, PlatformType, TaskPriority } from '../types';
import { TaskManager } from './TaskManager';
import { v4 as uuidv4 } from 'uuid';

export class InstructionParser {
  private taskManager: TaskManager;

  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  parseInstruction(content: string, userId?: string): UserInstruction {
    return {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      userId
    };
  }

  /**
   * Parse instruction and create tasks
   * This is a simplified version - in production, this would use NLP/AI to better understand instructions
   */
  createTasksFromInstruction(instruction: UserInstruction): Task[] {
    const tasks: Task[] = [];
    const content = instruction.content.toLowerCase();

    // Simple keyword-based platform detection
    const platformKeywords: Record<string, PlatformType> = {
      'wix': PlatformType.WIX,
      'website': PlatformType.WIX,
      'slack': PlatformType.SLACK,
      'message': PlatformType.SLACK,
      'github': PlatformType.GITHUB,
      'repository': PlatformType.GITHUB,
      'pr': PlatformType.GITHUB,
      'bing': PlatformType.BING_COPILOT,
      'copilot': PlatformType.BING_COPILOT,
      'search': PlatformType.BING_COPILOT,
      'gemini': PlatformType.GEMINI,
      'claude': PlatformType.CLAUDE
    };

    // Priority detection
    let priority = TaskPriority.MEDIUM;
    if (content.includes('urgent') || content.includes('critical')) {
      priority = TaskPriority.CRITICAL;
    } else if (content.includes('high priority')) {
      priority = TaskPriority.HIGH;
    } else if (content.includes('low priority')) {
      priority = TaskPriority.LOW;
    }

    // Detect platforms mentioned
    const detectedPlatforms: PlatformType[] = [];
    for (const [keyword, platform] of Object.entries(platformKeywords)) {
      if (content.includes(keyword)) {
        if (!detectedPlatforms.includes(platform)) {
          detectedPlatforms.push(platform);
        }
      }
    }

    // If no platform detected, create a general task
    if (detectedPlatforms.length === 0) {
      detectedPlatforms.push(PlatformType.CLAUDE); // Default to Claude for general AI tasks
    }

    // Create tasks for each platform
    for (const platform of detectedPlatforms) {
      const task = this.taskManager.createTask(
        this.generateTaskDescription(instruction.content, platform),
        instruction.content,
        platform,
        priority
      );
      tasks.push(task);
    }

    return tasks;
  }

  private generateTaskDescription(content: string, platform: PlatformType): string {
    return `[${platform}] ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
  }
}
