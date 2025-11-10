/**
 * Tests for TSC Manager Server API
 */

import { TSCManagerServer } from '../server/index';

describe('TSCManagerServer', () => {
  let server: TSCManagerServer;
  const TEST_PORT = 3001;
  const TEST_API_KEY = 'test-api-key';

  beforeAll(() => {
    server = new TSCManagerServer(TEST_PORT, [TEST_API_KEY]);
    server.start();
  });

  afterAll(() => {
    server.stop();
  });

  describe('Health Check', () => {
    it('should return 200 OK without authentication', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json() as { status: string; timestamp: string };
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks`);
      expect(response.status).toBe(401);
      
      const data = await response.json() as { error: string };
      expect(data.error).toBe('API key required');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks`, {
        headers: { 'X-API-Key': 'invalid-key' }
      });
      expect(response.status).toBe(403);
      
      const data = await response.json() as { error: string };
      expect(data.error).toBe('Invalid API key');
    });

    it('should accept requests with valid API key in header', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      expect(response.status).toBe(200);
    });

    it('should accept requests with valid API key in query', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks?apiKey=${TEST_API_KEY}`);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return empty tasks array initially', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/tasks`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json() as { tasks: unknown[] };
      expect(data.tasks).toEqual([]);
    });
  });

  describe('POST /api/instructions', () => {
    it('should accept valid instruction', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({
          instruction: 'Test instruction',
          userId: 'test-user'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json() as { tasks: unknown[] };
      expect(data.tasks).toBeDefined();
      expect(Array.isArray(data.tasks)).toBe(true);
    });

    it('should reject instruction without content', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(400);
      const data = await response.json() as { error: string };
      expect(data.error).toContain('Instruction is required');
    });

    it('should sanitize malicious input', async () => {
      const maliciousInput = '<script>alert("XSS")</script>Test instruction';
      
      const response = await fetch(`http://localhost:${TEST_PORT}/api/instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({
          instruction: maliciousInput
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json() as { tasks: Array<{ instructions: string }> };
      expect(data.tasks).toBeDefined();
      expect(Array.isArray(data.tasks)).toBe(true);
      expect(data.tasks.length).toBeGreaterThan(0);
      // Script tags should be removed
      expect(data.tasks[0].instructions).not.toContain('<script>');
    });
  });

  describe('GET /api/platforms', () => {
    it('should return available platforms', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/platforms`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json() as { platforms: unknown[] };
      expect(data.platforms).toBeDefined();
      expect(Array.isArray(data.platforms)).toBe(true);
    });
  });

  describe('GET /api/approvals', () => {
    it('should return pending approvals', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/approvals`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json() as { approvals: unknown[] };
      expect(data.approvals).toBeDefined();
      expect(Array.isArray(data.approvals)).toBe(true);
    });
  });
});
