# Quick Start Guide

This guide will help you get started with the TSC Manager AI agent system.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/akaindustries19-wq/Tsc-manager.git
cd Tsc-manager
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Basic Usage

### Step 1: Import and Initialize

```typescript
import { AIManager } from 'tsc-manager';

// Create an AI Manager instance
const aiManager = new AIManager({ autoApprove: true });
```

### Step 2: Process Instructions

```typescript
// Simple instruction
await aiManager.processInstruction('Create a landing page on Wix');

// Multi-platform instruction
await aiManager.processInstruction(
  'Search using Bing for AI trends, analyze with Gemini, and create a summary on Wix'
);
```

### Step 3: Monitor Tasks

```typescript
// Get all tasks
const tasks = aiManager.getTasks();

// Get completed tasks
const completed = aiManager.getTasksByStatus(TaskStatus.COMPLETED);

// Get platform-specific tasks
const githubTasks = aiManager.getTasksByPlatform(PlatformType.GITHUB);
```

## Running the Example

The project includes a comprehensive example demonstrating all features:

```bash
npm run dev
# or
npx ts-node src/example.ts
```

## Manual Approval Mode

For production use, enable manual approval:

```typescript
const aiManager = new AIManager({ autoApprove: false });

// Process instruction (will wait for approval)
const tasks = await aiManager.processInstruction('Deploy to production');

// Get pending approvals
const pending = aiManager.getPendingApprovals();

// Approve or reject
aiManager.approveTask(pending[0].id);
// or
aiManager.rejectTask(pending[0].id);
```

## Platform-Specific Configuration

Configure individual platforms:

```typescript
const aiManager = new AIManager({
  autoApprove: false,
  platforms: [
    {
      platform: PlatformType.GITHUB,
      enabled: true,
      credentials: {
        token: process.env.GITHUB_TOKEN
      }
    },
    {
      platform: PlatformType.SLACK,
      enabled: true,
      credentials: {
        botToken: process.env.SLACK_BOT_TOKEN
      }
    },
    {
      platform: PlatformType.WIX,
      enabled: false  // Disable Wix
    }
  ]
});
```

## Available Platforms

### Wix Platform

The **Wix Platform** supports website creation and management:

**Mock Mode (No Credentials Required)**
- Works out-of-the-box for testing and development
- Returns simulated results
- Perfect for demos and prototyping

**Real Mode (With Credentials)**
- Connects to actual Wix sites via Wix SDK
- Requires API credentials from [Wix Developers](https://dev.wix.com/)
- Supports real page management and site operations

**Supported Operations:**
- Create, update, and delete pages
- Publish site changes
- SEO optimization
- Site information retrieval

**Configuration:**
```typescript
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
```

### Other Platforms

- **Slack**: Team communication
- **GitHub**: Repository and CI/CD management
- **Bing Copilot**: Search and research
- **Gemini**: AI analysis and processing
- **Claude**: Conversational AI and code assistance

## Task Priority

Set task priority in instructions:

```typescript
// Critical priority
await aiManager.processInstruction('URGENT: Fix production bug in GitHub');

// High priority
await aiManager.processInstruction('High priority: Update landing page on Wix');

// Low priority
await aiManager.processInstruction('Low priority: Send weekly report on Slack');
```

## Testing

Run the test suite:

```bash
npm test
```

Run specific tests:

```bash
npm test TaskManager
npm test AIManager
```

## Development

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

## Next Steps

1. Review the [API documentation](../README.md#api-reference)
2. Explore the [example file](../src/example.ts)
3. Create your own platform integration
4. Configure real API credentials for production use

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Test Failures

Run tests with verbose output:
```bash
npm test -- --verbose
```

### Platform Issues

Check platform initialization:
```typescript
const platforms = aiManager.getPlatforms();
for (const platform of platforms) {
  const healthy = await platform.isHealthy();
  console.log(`${platform.getPlatformType()}: ${healthy ? 'OK' : 'ERROR'}`);
}
```

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/akaindustries19-wq/Tsc-manager).
