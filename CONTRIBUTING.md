# Contributing to TSC Manager

Thank you for your interest in contributing to TSC Manager! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Tsc-manager.git
   cd Tsc-manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
npm test
```

For watch mode:
```bash
npm test -- --watch
```

### Linting

```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint -- --fix
```

### Building

```bash
npm run build
```

### Running Examples

```bash
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over promises

## Testing Guidelines

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Test both success and error cases

Example:
```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = methodName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Adding a New Platform

1. Create a new file in `src/platforms/`:
   ```typescript
   import { BasePlatform } from './BasePlatform';
   import { PlatformType, Task, TaskResult, Agent } from '../types';
   
   export class YourPlatform extends BasePlatform {
     getPlatformType(): PlatformType {
       return PlatformType.YOUR_PLATFORM;
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

2. Add the platform type to `src/types/index.ts`:
   ```typescript
   export enum PlatformType {
     // ... existing platforms
     YOUR_PLATFORM = 'YOUR_PLATFORM'
   }
   ```

3. Register in `src/platforms/index.ts`:
   ```typescript
   export { YourPlatform } from './YourPlatform';
   ```

4. Add to AIManager initialization in `src/core/AIManager.ts`

5. Write tests for your platform

6. Update documentation

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update documentation in the `docs/` folder
3. Ensure all tests pass
4. Ensure code passes linting
5. Update the example if your changes affect usage
6. Write a clear PR description explaining:
   - What changes you made
   - Why you made them
   - How to test them

### PR Title Format

Use conventional commits format:
- `feat: Add new platform support`
- `fix: Resolve task delegation issue`
- `docs: Update API documentation`
- `test: Add tests for TaskManager`
- `refactor: Improve error handling`
- `chore: Update dependencies`

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in present tense
- Keep the first line under 50 characters
- Add details in the body if needed

Good examples:
```
Add support for custom platform configuration
Fix task verification logic
Update documentation for approval workflow
```

## Issue Reporting

When creating an issue, please include:

1. **Description**: Clear description of the problem or feature
2. **Steps to Reproduce**: For bugs, provide steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, etc.
6. **Code Sample**: Minimal code to reproduce the issue

## Feature Requests

For feature requests, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other approaches you considered
4. **Examples**: Similar features in other projects

## Code Review

All submissions require review. We will:
- Review code for quality and adherence to guidelines
- Provide constructive feedback
- Work with you to improve the contribution
- Merge once approved

## Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Adding new configuration options
- Creating new examples

Documentation locations:
- Main README: Overview and getting started
- docs/QUICKSTART.md: Quick start guide
- docs/ARCHITECTURE.md: Architecture details
- Code comments: Implementation details

## Security

If you discover a security vulnerability:
1. **Do not** open a public issue
2. Email the maintainers privately
3. Provide details about the vulnerability
4. Allow time for a fix before disclosure

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in:
- The README.md file
- Release notes
- GitHub contributors list

Thank you for contributing! 🎉
