# TSC Manager - AI Manager for AI Agents

A comprehensive AI management system that orchestrates AI agents across multiple platforms including Wix, Slack, GitHub, Bing Copilot, Gemini, and Claude. The AI Manager delegates tasks, handles approvals, implements solutions, and verifies functionality across all integrated platforms.

## Features

- **Multi-Platform Support**: Integrate with Wix, Slack, GitHub, Bing Copilot, Gemini, and Claude
- **Task Delegation**: Automatically assign tasks to the most appropriate AI agents
- **Approval Workflow**: Built-in approval system for task execution
- **Task Verification**: Automated verification of completed tasks
- **Priority Management**: Support for task prioritization (Low, Medium, High, Critical)
- **Instruction Parsing**: Natural language instruction processing
- **Extensible Architecture**: Easy to add new platforms and capabilities

## Architecture

### Core Components

1. **AIManager**: Main orchestrator that coordinates all operations
2. **TaskManager**: Handles task lifecycle and state management
3. **ApprovalManager**: Manages approval workflow for tasks
4. **InstructionParser**: Parses user instructions and creates tasks
5. **TaskDelegator**: Assigns tasks to appropriate agents and platforms

### Platform Integrations

- **WixPlatform**: Website creation and management with Wix SDK integration
  - Page creation, updating, and deletion
  - Site publishing and deployment
  - SEO optimization
  - Site management and monitoring
  - Works in mock mode without credentials for testing
  - Supports real Wix API integration with proper credentials
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
      platform: PlatformType.WIX,
      enabled: true,
      credentials: {
        apiKey: 'your-wix-api-key',
        accountId: 'your-account-id',
        siteId: 'your-site-id',
        accessToken: 'your-oauth-access-token'
      }
    },
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

## Wix Platform Setup

The TSC Manager includes full support for Wix site management through the Wix JavaScript SDK. The platform can operate in two modes:

### Mock Mode (Default)

Works without any credentials - perfect for development, testing, and demos:

```typescript
const aiManager = new AIManager({ autoApprove: true });
await aiManager.processInstruction('Create a landing page on Wix');
// Returns mock results without requiring real Wix credentials
```

### Real Mode (Production)

Connect to actual Wix sites using credentials from the [Wix Developer Platform](https://dev.wix.com/):

1. **Get Wix Credentials**
   - Sign up at [Wix Developers](https://dev.wix.com/)
   - Create an app or use your existing site credentials
   - Obtain your API Key, Account ID, Site ID, and/or OAuth Access Token

2. **Configure Environment Variables**
   ```bash
   WIX_API_KEY=your_wix_api_key
   WIX_ACCOUNT_ID=your_wix_account_id
   WIX_SITE_ID=your_wix_site_id
   WIX_ACCESS_TOKEN=your_oauth_access_token
   ```

3. **Initialize with Credentials**
   ```typescript
   import { AIManager, PlatformType } from 'tsc-manager';
   
   const aiManager = new AIManager({
     autoApprove: true,
     platforms: [
       {
         platform: PlatformType.WIX,
         enabled: true,
         credentials: {
           apiKey: process.env.WIX_API_KEY,
           accountId: process.env.WIX_ACCOUNT_ID,
           siteId: process.env.WIX_SITE_ID,
           accessToken: process.env.WIX_ACCESS_TOKEN
         }
       }
     ]
   });
   ```

### Supported Wix Operations

- **Page Management**: Create, update, and delete pages
- **Site Publishing**: Publish site changes to production
- **SEO Optimization**: Optimize pages for search engines
- **Site Information**: Retrieve site status and configuration

### Example Usage

```typescript
// Create a new landing page
await aiManager.processInstruction('Create a new landing page on Wix for our product launch');

// Update existing page
await aiManager.processInstruction('Update the homepage content on Wix');

// Optimize for SEO
await aiManager.processInstruction('Optimize the site for SEO on Wix');

// Publish changes
await aiManager.processInstruction('Publish the Wix site to production');
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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
