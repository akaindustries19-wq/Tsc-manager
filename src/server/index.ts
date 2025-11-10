/**
 * Web Server for TSC Manager with REST API and WebSocket support
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { AIManager } from '../core/AIManager';
import { TaskStatus, PlatformType } from '../types';

interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export class TSCManagerServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private aiManager: AIManager;
  private port: number;
  private apiKeys: Set<string>;

  constructor(port: number = 3000, apiKeys: string[] = []) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });
    this.aiManager = new AIManager({ autoApprove: false });
    this.apiKeys = new Set(apiKeys.length > 0 ? apiKeys : [process.env.API_KEY || 'default-api-key']);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          frameSrc: ["'self'", "*"], // Allow embedding
          frameAncestors: ["'self'", "*"], // Allow being embedded
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    // CORS - allow embedding
    this.app.use(cors({
      origin: true, // Allow all origins for embedding
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // API Key authentication middleware
    this.app.use('/api/', this.authenticateApiKey.bind(this));

    // Serve static files
    this.app.use(express.static(path.join(__dirname, '../../public')));
  }

  private authenticateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    if (!this.apiKeys.has(apiKey)) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    req.apiKey = apiKey;
    next();
  }

  private setupRoutes(): void {
    // Health check (no auth required)
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes

    // Get all tasks
    this.app.get('/api/tasks', (req: Request, res: Response) => {
      try {
        const tasks = this.aiManager.getTasks();
        res.json({ tasks });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
      }
    });

    // Get tasks by status
    this.app.get('/api/tasks/status/:status', (req: Request, res: Response) => {
      try {
        const status = req.params.status.toUpperCase() as TaskStatus;
        if (!Object.values(TaskStatus).includes(status)) {
          res.status(400).json({ error: 'Invalid status' });
          return;
        }
        const tasks = this.aiManager.getTasksByStatus(status);
        res.json({ tasks });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
      }
    });

    // Get tasks by platform
    this.app.get('/api/tasks/platform/:platform', (req: Request, res: Response) => {
      try {
        const platform = req.params.platform.toUpperCase() as PlatformType;
        if (!Object.values(PlatformType).includes(platform)) {
          res.status(400).json({ error: 'Invalid platform' });
          return;
        }
        const tasks = this.aiManager.getTasksByPlatform(platform);
        res.json({ tasks });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
      }
    });

    // Get specific task
    this.app.get('/api/tasks/:id', (req: Request, res: Response) => {
      try {
        const task = this.aiManager.getTask(req.params.id);
        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
        res.json({ task });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve task' });
      }
    });

    // Submit instruction
    this.app.post('/api/instructions', async (req: Request, res: Response) => {
      try {
        const { instruction, userId } = req.body;
        
        // Input validation
        if (!instruction || typeof instruction !== 'string') {
          res.status(400).json({ error: 'Instruction is required and must be a string' });
          return;
        }

        // Sanitize input
        const sanitizedInstruction = this.sanitizeInput(instruction);
        
        const tasks = await this.aiManager.processInstruction(sanitizedInstruction, userId);
        
        // Broadcast to WebSocket clients
        this.broadcastUpdate({ type: 'tasks_created', tasks });
        
        res.json({ tasks, message: 'Instruction processed successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to process instruction' });
      }
    });

    // Get pending approvals
    this.app.get('/api/approvals', (req: Request, res: Response) => {
      try {
        const approvals = this.aiManager.getPendingApprovals();
        res.json({ approvals });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve approvals' });
      }
    });

    // Approve task
    this.app.post('/api/approvals/:id/approve', (req: Request, res: Response) => {
      try {
        this.aiManager.approveTask(req.params.id);
        this.broadcastUpdate({ type: 'task_approved', approvalId: req.params.id });
        res.json({ message: 'Task approved successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to approve task' });
      }
    });

    // Reject task
    this.app.post('/api/approvals/:id/reject', (req: Request, res: Response) => {
      try {
        this.aiManager.rejectTask(req.params.id);
        this.broadcastUpdate({ type: 'task_rejected', approvalId: req.params.id });
        res.json({ message: 'Task rejected successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to reject task' });
      }
    });

    // Get platforms
    this.app.get('/api/platforms', (req: Request, res: Response) => {
      try {
        const platforms = this.aiManager.getPlatforms();
        res.json({ platforms });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve platforms' });
      }
    });

    // Error handling middleware
    this.app.use((err: Error, req: Request, res: Response) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received WebSocket message:', data);
          
          // Handle different message types
          if (data.type === 'subscribe') {
            // Client subscribed to updates
            ws.send(JSON.stringify({ type: 'subscribed', message: 'Successfully subscribed to updates' }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      // Send welcome message
      ws.send(JSON.stringify({ type: 'connected', message: 'Connected to TSC Manager' }));
    });
  }

  private broadcastUpdate(data: unknown): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data));
      }
    });
  }

  private sanitizeInput(input: string): string {
    // Remove any HTML tags and dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 1000); // Limit length
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`TSC Manager Server running on port ${this.port}`);
      console.log(`API: http://localhost:${this.port}/api`);
      console.log(`WebSocket: ws://localhost:${this.port}/ws`);
      console.log(`UI: http://localhost:${this.port}`);
    });
  }

  public stop(): void {
    this.wss.close();
    this.server.close();
  }
}

// Start server if run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3000', 10);
  const apiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  const server = new TSCManagerServer(port, apiKeys);
  server.start();
}
