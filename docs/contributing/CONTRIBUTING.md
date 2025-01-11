# Contributing to Visu-Net

First off, thank you for considering contributing to Visu-Net! It's people like you that make Visu-Net such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists, if applicable

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript and React styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### TypeScript Styleguide

* Use TypeScript strict mode
* Use interface over type when possible
* Use explicit types instead of inferring when the type isn't obvious
* Use meaningful variable names
* Use async/await over raw promises
* Use early returns to avoid nesting

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  if (!id) {
    throw new Error('ID is required');
  }

  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Bad
type user = {
  id: string,
  name: string,
  email: string,
}

function getUser(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject('ID is required');
    } else {
      fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
    }
  });
}
```

### React Styleguide

* Use functional components with hooks
* Use TypeScript with React
* Use proper prop types
* Use meaningful component names
* Keep components small and focused
* Use CSS-in-JS or CSS modules

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={styles.button}
    >
      {children}
    </button>
  );
};

// Bad
const Button = (props) => {
  return (
    <button 
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ padding: '10px' }}
    >
      {props.children}
    </button>
  );
};
```

### Documentation Styleguide

* Use Markdown
* Use code examples
* Document all public APIs
* Include usage examples
* Keep documentation up to date with code changes

```typescript
/**
 * Calculates the network loss based on predictions and actual values.
 * 
 * @param predictions - The network's output predictions
 * @param actual - The actual target values
 * @param lossType - The type of loss function to use
 * @returns The calculated loss value
 * 
 * @example
 * ```typescript
 * const loss = calculateLoss(
 *   [[0.2, 0.8]], 
 *   [[0, 1]], 
 *   'crossEntropy'
 * );
 * ```
 */
function calculateLoss(
  predictions: number[][],
  actual: number[][],
  lossType: LossType
): number {
  // Implementation
}
```

## Testing

### Unit Tests

* Write meaningful test descriptions
* Test one thing per test
* Use proper assertions
* Mock external dependencies
* Follow AAA (Arrange, Act, Assert) pattern

```typescript
describe('NetworkManager', () => {
  it('should correctly initialize a new network', () => {
    // Arrange
    const config = {
      layers: [
        { type: 'input', size: 784 },
        { type: 'hidden', size: 128 },
        { type: 'output', size: 10 }
      ]
    };

    // Act
    const network = new NetworkManager(config);

    // Assert
    expect(network.layers).toHaveLength(3);
    expect(network.layers[0].size).toBe(784);
  });
});
```

### Integration Tests

* Test component integration
* Test data flow
* Test error handling
* Test edge cases
* Use realistic test data

## Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Setting Up Development Environment

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run tests:
```bash
npm test
```

4. Build:
```bash
npm run build
```

## Questions?

Feel free to open an issue or contact the maintainers if you have any questions. 