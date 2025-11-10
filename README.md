# TSC Manager - AI Manager for AI Agents

A comprehensive AI management system that orchestrates AI agents across multiple platforms including Wix, Slack, GitHub, Bing Copilot, Gemini, and Claude. The AI Manager delegates tasks, handles approvals, implements solutions, and verifies functionality across all integrated platforms.

## ✨ New Features

- **🎨 Modern Web UI**: Beautiful, responsive dashboard for managing AI agents
- **🔌 REST API**: Complete API for programmatic access
- **⚡ Real-time Updates**: WebSocket support for instant notifications
- **🔒 Security**: API authentication, rate limiting, input sanitization, and security headers
- **🌐 Embeddable**: Can be embedded in any webpage via iframe or web component

## Features

- **Multi-Platform Support**: Integrate with Wix, Slack, GitHub, Bing Copilot, Gemini, and Claude
- **Task Delegation**: Automatically assign tasks to the most appropriate AI agents
- **Approval Workflow**: Built-in approval system for task execution
- **Task Verification**: Automated verification of completed tasks
- **Priority Management**: Support for task prioritization (Low, Medium, High, Critical)
- **Instruction Parsing**: Natural language instruction processing
- **Extensible Architecture**: Easy to add new platforms and capabilities
- **Web Dashboard**: Manage everything through an intuitive web interface
- **REST API**: Programmatic access to all features
- **Real-time Updates**: WebSocket notifications for task status changes

## Quick Start

### Web UI

1. Install dependencies:
```bash
npm install
```

2. Start the web server:
```bash
npm run server
```

3. Open your browser:
```
http://localhost:3000
```

4. Start managing your AI agents through the web interface!

### API Usage

```bash
# Submit an instruction via API
curl -X POST http://localhost:3000/api/instructions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: default-api-key" \
  -d '{"instruction": "Create a landing page on Wix"}'
```

See [Web UI & API Documentation](docs/WEB_UI_API.md) for complete API reference.

## Architecture

### Core Components

1. **AIManager**: Main orchestrator that coordinates all operations
2. **TaskManager**: Handles task lifecycle and state management
3. **ApprovalManager**: Manages approval workflow for tasks
4. **InstructionParser**: Parses user instructions and creates tasks
5. **TaskDelegator**: Assigns tasks to appropriate agents and platforms
6. **Web Server**: Express-based server with REST API and WebSocket support

### Platform Integrations

- **WixPlatform**: Website creation and management
- **SlackPlatform**: Team communication and notifications
- **GitHubPlatform**: Repository management and CI/CD automation
- **BingCopilotPlatform**: Search and research capabilities
- **GeminiPlatform**: Advanced AI processing and analysis
- **ClaudePlatform**: Conversational AI and code assistance

## Installation

```bash
npm install
```

## Usage

### Web Interface

Start the server and use the web dashboard:

```bash
npm run server
```

Then open http://localhost:3000 in your browser.

### Basic Example

```typescript
import { AIManager } from 'tsc-manager';

// Create AI Manager instance
const aiManager = new AIManager({ autoApprove: true });

// Process an instruction
await aiManager.processInstruction(
  'Create a new landing page on Wix for our product launch'
);

// Get all tasks
const tasks = aiManager.getTasks();
console.log(tasks);
```

### With Manual Approval

```typescript
import { AIManager } from 'tsc-manager';

// Create AI Manager without auto-approve
const aiManager = new AIManager({ autoApprove: false });

// Process an instruction (will wait for approval)
const tasks = await aiManager.processInstruction(
  'Deploy the latest version to production'
);

// Get pending approvals
const pendingApprovals = aiManager.getPendingApprovals();

// Approve or reject
aiManager.approveTask(pendingApprovals[0].id);
// or
aiManager.rejectTask(pendingApprovals[0].id);
```

### Platform-Specific Tasks

```typescript
import { AIManager, PlatformType } from 'tsc-manager';

const aiManager = new AIManager({ autoApprove: true });

// GitHub-specific task
await aiManager.processInstruction(
  'Create a new GitHub repository and set up CI/CD pipeline'
);

// Slack notification
await aiManager.processInstruction(
  'Send a message to the #engineering channel on Slack'
);

// Multi-platform research
await aiManager.processInstruction(
  'Search using Bing for API best practices, then analyze with Gemini'
);
```

### Custom Platform Configuration

```typescript
import { AIManager, PlatformType } from 'tsc-manager';

const aiManager = new AIManager({
  autoApprove: false,
  platforms: [
    {
      platform: PlatformType.GITHUB,
      enabled: true,
      credentials: {
        token: 'your-github-token'
      }
    },
    {
      platform: PlatformType.SLACK,
      enabled: true,
      credentials: {
        botToken: 'your-slack-bot-token'
      }
    }
  ]
});
```

## API Reference

### AIManager

#### Constructor
```typescript
new AIManager(config?: {
  autoApprove?: boolean;
  platforms?: PlatformConfig[];
})
```

#### Methods

- `processInstruction(content: string, userId?: string): Promise<Task[]>`
  - Process a user instruction and create tasks

- `getTasks(): Task[]`
  - Get all tasks

- `getTasksByStatus(status: TaskStatus): Task[]`
  - Get tasks by status

- `getTasksByPlatform(platform: PlatformType): Task[]`
  - Get tasks by platform

- `approveTask(approvalRequestId: string): void`
  - Approve a pending task

- `rejectTask(approvalRequestId: string): void`
  - Reject a pending task

- `getPendingApprovals(): ApprovalRequest[]`
  - Get all pending approval requests

### Task Status

- `PENDING`: Task created, awaiting approval
- `APPROVED`: Task approved, ready for execution
- `IN_PROGRESS`: Task currently being executed
- `COMPLETED`: Task successfully completed
- `FAILED`: Task execution failed
- `REJECTED`: Task rejected during approval

### Task Priority

- `LOW`: Low priority task
- `MEDIUM`: Medium priority task
- `HIGH`: High priority task
- `CRITICAL`: Critical priority task

## Development

### Build

```bash
npm run build
```

### Run Example

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── core/               # Core business logic
│   ├── AIManager.ts    # Main orchestrator
│   ├── TaskManager.ts  # Task lifecycle management
│   ├── ApprovalManager.ts
│   ├── InstructionParser.ts
│   └── TaskDelegator.ts
├── platforms/          # Platform integrations
│   ├── IPlatform.ts    # Platform interface
│   ├── BasePlatform.ts # Base implementation
│   ├── WixPlatform.ts
│   ├── SlackPlatform.ts
│   ├── GitHubPlatform.ts
│   ├── BingCopilotPlatform.ts
│   ├── GeminiPlatform.ts
│   └── ClaudePlatform.ts
├── server/             # Web server
│   └── index.ts        # Express server with REST API
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── logger.ts
├── example.ts          # Usage examples
└── index.ts            # Main entry point
```

## Workflow

1. **User provides instruction**: Natural language instruction is received
2. **Instruction parsing**: System parses instruction and identifies required platforms
3. **Task creation**: Tasks are created for each identified action
4. **Approval (optional)**: Tasks are sent for approval if required
5. **Task delegation**: Approved tasks are assigned to appropriate agents
6. **Execution**: Agents execute tasks on their respective platforms
7. **Verification**: System verifies task completion and success
8. **Results**: Task results are stored and available for review

## Extending the System

### Adding a New Platform

1. Create a new platform class extending `BasePlatform`
2. Implement required methods
3. Register the platform in `AIManager`

```typescript
import { BasePlatform } from './BasePlatform';
import { PlatformType, Task, TaskResult, Agent } from '../types';

export class CustomPlatform extends BasePlatform {
  getPlatformType(): PlatformType {
    return PlatformType.CUSTOM;
  }

  protected async performInitialization(): Promise<void> {
    // Initialize your platform
  }

  async executeTask(task: Task): Promise<TaskResult> {
    // Execute task logic
    return this.createTaskResult(true, result);
  }

  async getAvailableAgents(): Promise<Agent[]> {
    // Return available agents
    return [];
  }
}
```

## Embedding TSC Manager

TSC Manager can be easily embedded in any webpage or application.

### Method 1: iframe

```html
<iframe 
  src="http://localhost:3000/?apiKey=your-api-key" 
  width="100%" 
  height="800px" 
  frameborder="0"
></iframe>
```

### Method 2: Web Component

```html
<!-- Include the widget script -->
<script src="http://localhost:3000/widget.js"></script>

<!-- Use the custom element -->
<tsc-manager-widget 
  api-key="your-api-key"
  height="800px"
></tsc-manager-widget>
```

See the [Web UI & API Documentation](docs/WEB_UI_API.md) for more details and examples.

## Security Features

- **API Key Authentication**: Secure API access
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: XSS protection
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **CORS Support**: Configurable cross-origin requests
- **Content Security Policy**: Prevents XSS attacks

## Documentation

- [Web UI & API Documentation](docs/WEB_UI_API.md) - Complete API reference and embedding guide
- [Architecture Documentation](docs/ARCHITECTURE.md) - Detailed architecture overview
- [Quick Start Guide](docs/QUICKSTART.md) - Get started quickly

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
