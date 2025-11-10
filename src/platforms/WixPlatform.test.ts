/**
 * Tests for WixPlatform
 */

import { WixPlatform } from './WixPlatform';
import { PlatformType, TaskStatus, TaskPriority } from '../types';

describe('WixPlatform', () => {
  let wixPlatform: WixPlatform;

  beforeEach(async () => {
    wixPlatform = new WixPlatform();
    await wixPlatform.initialize();
  });

  describe('initialization', () => {
    it('should initialize in mock mode without credentials', async () => {
      const status = wixPlatform.getConfigStatus();
      expect(status.configured).toBe(false);
      expect(status.mode).toBe('mock');
    });

    it('should initialize with credentials when provided', async () => {
      const configuredPlatform = new WixPlatform({
        apiKey: 'test-api-key',
        siteId: 'test-site-id'
      });
      await configuredPlatform.initialize();
      
      const status = configuredPlatform.getConfigStatus();
      expect(status.configured).toBe(true);
    });
  });

  describe('getPlatformType', () => {
    it('should return WIX platform type', () => {
      expect(wixPlatform.getPlatformType()).toBe(PlatformType.WIX);
    });
  });

  describe('executeTask', () => {
    it('should execute a page creation task', async () => {
      const task = {
        id: 'task-1',
        description: 'Create a landing page',
        instructions: 'Create a new landing page on Wix',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('platform', 'Wix');
      expect(result.output).toHaveProperty('action', 'create-page');
      expect(result.output).toHaveProperty('mode', 'mock');
    });

    it('should execute a page update task', async () => {
      const task = {
        id: 'task-2',
        description: 'Update page content',
        instructions: 'Update the homepage content',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('action', 'update-page');
    });

    it('should execute a site publish task', async () => {
      const task = {
        id: 'task-3',
        description: 'Publish site',
        instructions: 'Publish the website to production',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('action', 'publish-site');
      const output = result.output as { result: { status: string } };
      expect(output.result).toHaveProperty('status', 'published');
    });

    it('should execute SEO optimization task', async () => {
      const task = {
        id: 'task-4',
        description: 'SEO optimization',
        instructions: 'Optimize the site for SEO',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('action', 'seo-optimization');
      const output = result.output as { result: { improvements: string[] } };
      expect(output.result).toHaveProperty('improvements');
    });

    it('should handle page deletion task', async () => {
      const task = {
        id: 'task-5',
        description: 'Delete old page',
        instructions: 'Delete the outdated contact page',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('action', 'delete-page');
    });

    it('should handle general site management task', async () => {
      const task = {
        id: 'task-6',
        description: 'Manage site',
        instructions: 'Get site information and status',
        platform: PlatformType.WIX,
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await wixPlatform.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('action', 'site-management');
    });
  });

  describe('getAvailableAgents', () => {
    it('should return available Wix agents', async () => {
      const agents = await wixPlatform.getAvailableAgents();
      
      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].platform).toBe(PlatformType.WIX);
      expect(agents[0].isAvailable).toBe(true);
    });

    it('should return agents with proper capabilities', async () => {
      const agents = await wixPlatform.getAvailableAgents();
      
      const builderAgent = agents.find(a => a.name === 'Wix Website Builder');
      expect(builderAgent).toBeDefined();
      expect(builderAgent?.capabilities).toContain('page-creation');
      expect(builderAgent?.capabilities).toContain('seo-optimization');
      
      const seoAgent = agents.find(a => a.name === 'Wix SEO Specialist');
      expect(seoAgent).toBeDefined();
      expect(seoAgent?.capabilities).toContain('seo-optimization');
    });
  });

  describe('getSiteInfo', () => {
    it('should return site info in mock mode', async () => {
      const siteInfo = await wixPlatform.getSiteInfo();
      
      expect(siteInfo).toHaveProperty('mode', 'mock');
      expect(siteInfo).toHaveProperty('siteId');
    });

    it('should return configured site ID when provided', async () => {
      const configuredPlatform = new WixPlatform({
        siteId: 'my-site-123'
      });
      await configuredPlatform.initialize();
      
      const siteInfo = await configuredPlatform.getSiteInfo();
      
      expect(siteInfo).toHaveProperty('siteId', 'my-site-123');
    });
  });

  describe('isHealthy', () => {
    it('should report healthy after initialization', async () => {
      const healthy = await wixPlatform.isHealthy();
      expect(healthy).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should detect when not configured', () => {
      const platform = new WixPlatform();
      expect(platform.isConfiguredWithCredentials()).toBe(false);
    });

    it('should detect when configured with API key', () => {
      const platform = new WixPlatform({ apiKey: 'test-key' });
      expect(platform.isConfiguredWithCredentials()).toBe(true);
    });

    it('should detect when configured with access token', () => {
      const platform = new WixPlatform({ accessToken: 'test-token' });
      expect(platform.isConfiguredWithCredentials()).toBe(true);
    });
  });
});
