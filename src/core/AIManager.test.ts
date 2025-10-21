/**
 * Tests for AIManager
 */

import { AIManager } from '../core/AIManager';
import { TaskStatus, PlatformType } from '../types';

describe('AIManager', () => {
  let aiManager: AIManager;

  beforeEach(() => {
    aiManager = new AIManager({ autoApprove: true });
  });

  describe('initialization', () => {
    it('should initialize with platforms', () => {
      const platforms = aiManager.getPlatforms();
      expect(platforms.length).toBeGreaterThan(0);
    });
  });

  describe('processInstruction', () => {
    it('should process a simple instruction', async () => {
      const tasks = await aiManager.processInstruction(
        'Create a website on Wix'
      );

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].platform).toBe(PlatformType.WIX);
    });

    it('should process GitHub instruction', async () => {
      const tasks = await aiManager.processInstruction(
        'Create a GitHub repository'
      );

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].platform).toBe(PlatformType.GITHUB);
    });

    it('should process Slack instruction', async () => {
      const tasks = await aiManager.processInstruction(
        'Send a message on Slack'
      );

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].platform).toBe(PlatformType.SLACK);
    });

    it('should handle multi-platform instructions', async () => {
      const tasks = await aiManager.processInstruction(
        'Search on Bing and analyze with Gemini'
      );

      expect(tasks.length).toBeGreaterThan(1);
      const platforms = tasks.map(t => t.platform);
      expect(platforms).toContain(PlatformType.BING_COPILOT);
      expect(platforms).toContain(PlatformType.GEMINI);
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', async () => {
      await aiManager.processInstruction('Create a website on Wix');
      await aiManager.processInstruction('Send a message on Slack');

      const tasks = aiManager.getTasks();
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', async () => {
      await aiManager.processInstruction('Create a website on Wix');

      const completedTasks = aiManager.getTasksByStatus(TaskStatus.COMPLETED);
      expect(completedTasks.length).toBeGreaterThan(0);
    });
  });

  describe('getTasksByPlatform', () => {
    it('should filter tasks by platform', async () => {
      await aiManager.processInstruction('Create a website on Wix');
      await aiManager.processInstruction('Create a GitHub repository');

      const wixTasks = aiManager.getTasksByPlatform(PlatformType.WIX);
      expect(wixTasks.length).toBeGreaterThan(0);
      expect(wixTasks.every(t => t.platform === PlatformType.WIX)).toBe(true);
    });
  });

  describe('task execution', () => {
    it('should complete tasks automatically with auto-approve', async () => {
      const tasks = await aiManager.processInstruction('Create a website on Wix');
      
      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const task = aiManager.getTask(tasks[0].id);
      expect(task?.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe('platform configuration', () => {
    it('should respect platform enabled/disabled config', () => {
      const customManager = new AIManager({
        autoApprove: true,
        platforms: [
          {
            platform: PlatformType.GITHUB,
            enabled: false
          }
        ]
      });

      const platforms = customManager.getPlatforms();
      const githubPlatform = platforms.find(
        p => p.getPlatformType() === PlatformType.GITHUB
      );
      
      // GitHub should not be registered if disabled
      expect(githubPlatform).toBeUndefined();
    });
  });
});
