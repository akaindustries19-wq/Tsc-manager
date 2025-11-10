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

  // Example 1: Create a website page on Wix
  console.log('Example 1: Create Wix landing page');
  await aiManager.processInstruction(
    'Create a new landing page on Wix for our product launch'
  );
  console.log('✓ Wix page creation task completed\n');

  // Example 2: Update Wix site content
  console.log('Example 2: Update Wix content');
  await aiManager.processInstruction(
    'Update the homepage on Wix with new product information'
  );
  console.log('✓ Wix content update completed\n');

  // Example 3: Optimize Wix site for SEO
  console.log('Example 3: Wix SEO optimization');
  await aiManager.processInstruction(
    'Optimize the Wix site for SEO with meta tags and sitemap'
  );
  console.log('✓ Wix SEO optimization completed\n');

  // Example 4: Publish Wix site
  console.log('Example 4: Publish Wix site');
  await aiManager.processInstruction(
    'Publish the Wix site to production'
  );
  console.log('✓ Wix site published\n');

  // Example 5: Send a message via Slack
  console.log('Example 5: Slack notification');
  await aiManager.processInstruction(
    'Send a message to the team on Slack about the deployment'
  );
  console.log('✓ Slack notification sent\n');

  // Example 6: GitHub repository task
  console.log('Example 6: GitHub task');
  await aiManager.processInstruction(
    'Create a new GitHub repository for the project and set up CI/CD'
  );
  console.log('✓ GitHub repository created\n');

  // Example 7: Multi-platform research task
  console.log('Example 7: Multi-platform research task');
  await aiManager.processInstruction(
    'Search using Bing Copilot for best practices on API design, then summarize using Gemini'
  );
  console.log('✓ Multi-platform research completed\n');

  // Example 8: AI-assisted code review
  console.log('Example 8: Code review with Claude');
  await aiManager.processInstruction(
    'Review the latest pull request using Claude and provide feedback'
  );
  console.log('✓ Code review completed\n');

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
