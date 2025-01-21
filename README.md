# Visu-Net

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

<div align="center">
  <img src="docs/assets/logo.png" alt="Visu-Net Logo" width="200"/>
  <p><strong>Interactive Neural Network Visualization Tool</strong></p>
</div>

A powerful Neural Network Visualization Tool built with React and TypeScript that helps visualize and understand neural network architectures, training processes, and performance metrics in real-time. Perfect for education, research, and deep learning exploration.

## 🌟 Features

- 🧠 **Interactive Neural Network Architecture**

  - Drag-and-drop network design
  - Real-time architecture modification
  - Intuitive layer configuration
- 📊 **Advanced Visualizations**

  - Real-time training visualization
  - Weight distribution analysis
  - Activation pattern visualization
  - Error surface visualization
  - Loss landscape exploration
- 🎛️ **Comprehensive Controls**

  - Customizable training speed
  - Layer-wise parameter tuning
  - Batch size adjustment
  - Learning rate scheduling
- 📈 **Performance Analytics**

  - Real-time metrics tracking
  - Custom metric definitions
  - Performance comparison tools
  - Training history logs
- 💾 **Data Management**

  - Import/Export functionality
  - Model checkpointing
  - Training state persistence
  - Dataset management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Modern web browser (Chrome, Firefox, or Safari recommended)

### One-Line Installation (Unix/macOS/Linux)

```bash
git clone https://github.com/Chanakya5793/visu-net.git && cd visu-net/neural-vis && npm install && npm start
```

### Step-by-Step Installation

1. Clone the repository:

```bash
git clone https://github.com/Chanakya5793/visu-net.git
cd visu-net/neural-vis
```

2. Install dependencies:

### Using npm (recommended for all platforms):

```bash
npm install
```

### Alternative installation using requirements.txt:

#### On macOS/Linux:

```bash
# Navigate to the neural-vis directory first
cd visu-net/neural-vis

# Install all dependencies from package.json
npm install

# Or if you prefer yarn
yarn install
```

#### On Windows (PowerShell):

```powershell
# Navigate to the neural-vis directory first
cd visu-net\neural-vis

# Install all dependencies from package.json
npm install

# Or if you prefer yarn
yarn install
```

#### On Windows (Command Prompt):

```cmd
# Navigate to the neural-vis directory first
cd visu-net\neural-vis

# Install all dependencies from package.json
npm install

# Or if you prefer yarn
yarn install
```

Note: The project uses `package.json` for dependency management, not `requirements.txt`. All required dependencies are listed in `package.json` and will be installed automatically with `npm install` or `yarn install`.

## Platform-Specific Setup

### Windows

1. Install Node.js and npm from [official Node.js website](https://nodejs.org/)
2. Open PowerShell or Command Prompt as Administrator
3. Navigate to the project directory:

```powershell
cd path\to\visu-net\neural-vis
```

4. Install dependencies using one of the methods above
5. Start the development server:

```powershell
npm start
```

### macOS

1. Install Node.js and npm using Homebrew:

```bash
brew install node
```

2. Open Terminal
3. Navigate to the project directory:

```bash
cd path/to/visu-net/neural-vis
```

4. Install dependencies using one of the methods above
5. Start the development server:

```bash
npm start
```

### Linux

1. Install Node.js and npm using your distribution's package manager:

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nodejs npm
```

For Fedora:

```bash
sudo dnf install nodejs npm
```

For Arch Linux:

```bash
sudo pacman -S nodejs npm
```

2. Open Terminal
3. Navigate to the project directory:

```bash
cd path/to/visu-net/neural-vis
```

4. Install dependencies using one of the methods above
5. Start the development server:

```bash
npm start
```

## Viewing requirements.txt Contents

You can view the contents of requirements.txt using different commands based on your operating system:

### Windows (PowerShell):

```powershell
Get-Content requirements.txt
# or
type requirements.txt

# Navigate to the neural-vis directory first
cd visu-net\neural-vis

# Install all dependencies from requirements.txt
npm install $(cat requirements.txt | Out-String).Split("`n") -save
```

### Windows (Command Prompt):

```cmd
type requirements.txt

# Navigate to the neural-vis directory first
cd visu-net\neural-vis

# Install all dependencies from requirements.txt
for /F "tokens=*" %i in (requirements.txt) do npm install %i --save
```

### macOS/Linux:

```bash
cat requirements.txt
# or
less requirements.txt
# or
more requirements.txt
```

## Package Versions

All major dependencies with their exact versions:

```
Core:
- react: 18.2.0
- react-dom: 18.2.0
- react-scripts: 5.0.1

UI Components:
- @mui/material: 6.3.1
- @mui/icons-material: 6.3.1
- @emotion/react: 11.14.0
- @emotion/styled: 11.14.0

Neural Network:
- brain.js: 2.0.0-beta.23

Visualization:
- recharts: 2.15.0

Utilities:
- jszip: 3.10.1
- web-vitals: 4.2.4

TypeScript Types:
- @types/react: 19.0.3
- @types/react-dom: 19.0.2
- @types/recharts: 1.8.29
- @types/jszip: 3.4.0
```

For a complete list of dependencies and their exact versions, see `requirements.txt` or `package.json`.

## Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Environment Variables

```env
REACT_APP_API_URL=your_api_url
REACT_APP_DEBUG_MODE=true
REACT_APP_VERSION=$npm_package_version
```

### Network Visualization

- Use the `NetworkVisualization` component to view the neural network architecture
- Hover over neurons to see activation values
- Click on connections to view weight information
- Use the zoom and pan controls to navigate larger networks

### Training Controls

- Adjust training speed using the speed control slider
- Start/pause training using the control panel
- Monitor real-time performance metrics during training
- Use the architecture controls to modify network structure

### Performance Analysis

- View loss and accuracy graphs in real-time
- Analyze weight distributions across layers
- Examine activation patterns for different inputs
- Explore the error surface visualization

### Import/Export

- Import existing network architectures through the Import Dialog
- Export trained models for later use
- Save and load training configurations

## Project Structure

```
neural-vis/
├── public/          # Static files
├── src/
│   ├── components/  # React components
│   │   ├── network/
│   │   │   ├── controls/      # Network control components
│   │   │   ├── visualization/ # Visualization components
│   │   │   ├── metrics/      # Performance metrics components
│   │   │   └── dialogs/      # Dialog components
│   ├── App.tsx     # Main application component
│   └── index.tsx   # Application entry point
├── package.json    # Project dependencies and scripts
└── tsconfig.json  # TypeScript configuration
```

## Dependencies

Main dependencies include:

- React 18
- Material-UI (MUI) v6
- Brain.js - Neural network implementation
- Recharts - Visualization charts
- TypeScript - Type safety and better developer experience

For a complete list of dependencies, see `package.json`.

## Troubleshooting

### Common Issues

1. **Development Server Issues**

   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`
   - Check port conflicts: `lsof -i :3000`
2. **Visualization Performance**

   - Reduce network size for complex architectures
   - Enable hardware acceleration in browser
   - Check browser console for warnings
3. **Memory Issues**

   - Increase Node.js memory limit: `NODE_OPTIONS=--max_old_space_size=4096`
   - Clear browser cache and reload
   - Monitor memory usage in task manager

## Contributing

### Development Process

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b my-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add my feature'
   ```
4. Push to the branch
   ```bash
   git push origin my-feature
   ```
5. Open a Pull Request

### Contribution Guidelines

- Fork the repository
- Create your feature branch
- Commit your changes
- Push to the branch
- Open a Pull Request

## Support

For bug reports and feature requests, please use the GitHub Issues section.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details. The license includes:

- Full MIT License terms
- Copyright notices for Visu-Net and its contributors
- Additional attribution for third-party packages
- Terms for contributions

For more details about our dependencies' licenses, check the ADDITIONAL ATTRIBUTION AND THIRD-PARTY NOTICES section in the [LICENSE](./LICENSE) file.

## Acknowledgments

- Brain.js team for the neural network implementation
- Material-UI team for the component library
- All contributors who have helped shape this project

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Chanakya5793/visu-net&type=Date)](https://star-history.com/#Chanakya5793/visu-net&Date)

## 📬 Contact

- Report bugs: [Issue Tracker](https://github.com/Chanakya5793/visu-net/issues)
- Feature requests: [Discussions](https://github.com/Chanakya5793/visu-net/discussions)
- Email: your.email@example.com
- Twitter: [@visu_net](https://twitter.com/visu_net)

---

<div align="center">
  Made with ❤️ by the Visu-Net Team
</div>
