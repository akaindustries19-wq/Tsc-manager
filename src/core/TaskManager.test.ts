/**
 * Tests for TaskManager
 */

import { TaskManager } from '../core/TaskManager';
import { TaskStatus, TaskPriority, PlatformType } from '../types';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  describe('createTask', () => {
    it('should create a task with correct properties', () => {
      const task = taskManager.createTask(
        'Test task',
        'Test instructions',
        PlatformType.GITHUB,
        TaskPriority.HIGH
      );

      expect(task.id).toBeDefined();
      expect(task.description).toBe('Test task');
      expect(task.instructions).toBe('Test instructions');
      expect(task.platform).toBe(PlatformType.GITHUB);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should use MEDIUM priority by default', () => {
      const task = taskManager.createTask(
        'Test task',
        'Test instructions',
        PlatformType.SLACK
      );

      expect(task.priority).toBe(TaskPriority.MEDIUM);
    });
  });

  describe('getTask', () => {
    it('should retrieve a task by ID', () => {
      const task = taskManager.createTask(
        'Test task',
        'Test instructions',
        PlatformType.WIX
      );

      const retrieved = taskManager.getTask(task.id);
      expect(retrieved).toEqual(task);
    });

    it('should return undefined for non-existent task', () => {
      const retrieved = taskManager.getTask('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      taskManager.createTask('Task 1', 'Instructions 1', PlatformType.GITHUB);
      taskManager.createTask('Task 2', 'Instructions 2', PlatformType.SLACK);
      taskManager.createTask('Task 3', 'Instructions 3', PlatformType.WIX);

      const allTasks = taskManager.getAllTasks();
      expect(allTasks).toHaveLength(3);
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks filtered by status', () => {
      const task1 = taskManager.createTask('Task 1', 'Instructions 1', PlatformType.GITHUB);
      const task2 = taskManager.createTask('Task 2', 'Instructions 2', PlatformType.SLACK);
      taskManager.createTask('Task 3', 'Instructions 3', PlatformType.WIX);

      taskManager.updateTaskStatus(task1.id, TaskStatus.COMPLETED);
      taskManager.updateTaskStatus(task2.id, TaskStatus.COMPLETED);

      const completedTasks = taskManager.getTasksByStatus(TaskStatus.COMPLETED);
      expect(completedTasks).toHaveLength(2);
      
      const pendingTasks = taskManager.getTasksByStatus(TaskStatus.PENDING);
      expect(pendingTasks).toHaveLength(1);
    });
  });

  describe('getTasksByPlatform', () => {
    it('should return tasks filtered by platform', () => {
      taskManager.createTask('Task 1', 'Instructions 1', PlatformType.GITHUB);
      taskManager.createTask('Task 2', 'Instructions 2', PlatformType.GITHUB);
      taskManager.createTask('Task 3', 'Instructions 3', PlatformType.SLACK);

      const githubTasks = taskManager.getTasksByPlatform(PlatformType.GITHUB);
      expect(githubTasks).toHaveLength(2);
      
      const slackTasks = taskManager.getTasksByPlatform(PlatformType.SLACK);
      expect(slackTasks).toHaveLength(1);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const task = taskManager.createTask('Test task', 'Instructions', PlatformType.GITHUB);
      
      taskManager.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
      const updated = taskManager.getTask(task.id);
      
      expect(updated?.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('assignAgent', () => {
    it('should assign an agent to a task', () => {
      const task = taskManager.createTask('Test task', 'Instructions', PlatformType.GITHUB);
      
      taskManager.assignAgent(task.id, 'agent-123');
      const updated = taskManager.getTask(task.id);
      
      expect(updated?.assignedAgent).toBe('agent-123');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed with result', () => {
      const task = taskManager.createTask('Test task', 'Instructions', PlatformType.GITHUB);
      const result = { success: true, output: 'Task completed' };
      
      taskManager.completeTask(task.id, result);
      const updated = taskManager.getTask(task.id);
      
      expect(updated?.status).toBe(TaskStatus.COMPLETED);
      expect(updated?.result).toEqual(result);
    });
  });

  describe('failTask', () => {
    it('should mark task as failed with error', () => {
      const task = taskManager.createTask('Test task', 'Instructions', PlatformType.GITHUB);
      
      taskManager.failTask(task.id, 'Task failed');
      const updated = taskManager.getTask(task.id);
      
      expect(updated?.status).toBe(TaskStatus.FAILED);
      expect(updated?.result?.success).toBe(false);
      expect(updated?.result?.error).toBe('Task failed');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const task = taskManager.createTask('Test task', 'Instructions', PlatformType.GITHUB);
      
      const deleted = taskManager.deleteTask(task.id);
      expect(deleted).toBe(true);
      
      const retrieved = taskManager.getTask(task.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent task', () => {
      const deleted = taskManager.deleteTask('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});
