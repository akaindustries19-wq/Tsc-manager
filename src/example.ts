/**
 * Example usage of the AI Manager
 */

import { AIManager, TaskStatus } from './index';

async function main() {
  console.log('=== AI Manager Demo ===\n');

  // Create AI Manager instance with auto-approve enabled for demo
  const aiManager = new AIManager({ autoApprove: true });

  console.log('AI Manager initialized with platforms:');
  const platforms = aiManager.getPlatforms();
  platforms.forEach(platform => {
    console.log(`  - ${platform.getPlatformType()}`);
  });
  console.log('');

  // Example 1: Create a website task
  console.log('Example 1: Website creation task');
  await aiManager.processInstruction(
    'Create a new landing page on Wix for our product launch'
  );
  console.log('');

  // Example 2: Send a message via Slack
  console.log('Example 2: Slack notification');
  await aiManager.processInstruction(
    'Send a message to the team on Slack about the deployment'
  );
  console.log('');

  // Example 3: GitHub repository task
  console.log('Example 3: GitHub task');
  await aiManager.processInstruction(
    'Create a new GitHub repository for the project and set up CI/CD'
  );
  console.log('');

  // Example 4: Multi-platform task
  console.log('Example 4: Multi-platform research task');
  await aiManager.processInstruction(
    'Search using Bing Copilot for best practices on API design, then summarize using Gemini'
  );
  console.log('');

  // Example 5: AI-assisted code review
  console.log('Example 5: Code review with Claude');
  await aiManager.processInstruction(
    'Review the latest pull request using Claude and provide feedback'
  );
  console.log('');

  // Display task summary
  console.log('\n=== Task Summary ===');
  const allTasks = aiManager.getTasks();
  console.log(`Total tasks: ${allTasks.length}`);
  
  const completed = aiManager.getTasksByStatus(TaskStatus.COMPLETED);
  console.log(`Completed: ${completed.length}`);
  
  const failed = aiManager.getTasksByStatus(TaskStatus.FAILED);
  console.log(`Failed: ${failed.length}`);
  
  const inProgress = aiManager.getTasksByStatus(TaskStatus.IN_PROGRESS);
  console.log(`In Progress: ${inProgress.length}`);

  console.log('\nTask Details:');
  allTasks.forEach((task, index) => {
    console.log(`\nTask ${index + 1}:`);
    console.log(`  ID: ${task.id}`);
    console.log(`  Description: ${task.description}`);
    console.log(`  Platform: ${task.platform}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  Priority: ${task.priority}`);
    if (task.assignedAgent) {
      console.log(`  Assigned to: ${task.assignedAgent}`);
    }
    if (task.result) {
      console.log(`  Result: ${JSON.stringify(task.result, null, 2)}`);
    }
  });
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

export { main };
