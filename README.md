<div align="center">
  <h1>🎯 CSS Class Finder - GUI</h1>
  <p><strong>A beautiful desktop application for finding unused CSS classes in your project directories</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Tauri-2.0-blue?style=flat-square&logo=tauri" alt="Tauri">
    <img src="https://img.shields.io/badge/Angular-17-red?style=flat-square&logo=angular" alt="Angular">
    <img src="https://img.shields.io/badge/Rust-Latest-orange?style=flat-square&logo=rust" alt="Rust">
    <img src="https://img.shields.io/badge/Material-Design-purple?style=flat-square&logo=material-design" alt="Material Design">
  </p>
</div>

---

A powerful desktop application built with **Tauri v2** and **Angular** that provides a beautiful graphical interface for analyzing CSS/SCSS files and finding unused classes in your projects. This GUI version builds upon the robust [tag-finder-cli](https://github.com/renseck/tag-finder-cli) backend with an intuitive, modern interface.

## Features

### **Beautiful Interface**
- **Material Design** with light/dark theme toggle
- **Responsive layout** that works on any screen size
- **Intuitive file browser** for easy directory selection
- **Real-time progress indicators** for long-running analyses

### **Powerful Analysis Tools**
- **Unused CSS Detection**: Find CSS classes defined in stylesheets but not used anywhere in your project
- **Word Search**: Search for specific words/terms and see if they appear only in CSS files
- **Visual Reports**: Interactive, expandable file-by-file breakdowns
- **Detailed Statistics**: Comprehensive metrics about your CSS usage

### **Performance & Reliability**
- **Fast Rust Backend**: Leverages the high-performance tag-finder-cli engine
- **Standalone Executable**: No dependencies required for end users
- **Memory Efficient**: Handles large codebases without breaking a sweat
## Build from Source

#### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

#### Build Steps
```bash
# Clone the repository
git clone https://github.com/renseck/TagFinder.git
cd TagFinder

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

The built executable will be in `src-tauri/target/release/bundle/`.

## Usage

### 1. **Select Your Project Directory**
- Click the "Browse" button to open the native file picker
- The app remembers your last selected directory

### 2. **Find Unused CSS Classes**
- Click "Find Unused CSS Classes" to start the analysis
- View results in an interactive, expandable report
- See detailed statistics and file-by-file breakdowns

### 3. **Search for Specific Words**
- Enter any word or CSS class name in the search box
- Click "Search" to find where it's used in your project
- Identify CSS-only references that might be safe to remove

### 4. **Customize Your Experience**
- Toggle between light and dark themes using the theme switcher
- Expand/collapse file sections in reports for better navigation

## What You'll See

### Unused Classes Report
- **Summary statistics** showing total classes analyzed and unused percentage
- **File-by-file breakdown** of unused classes
- **Line numbers** for each unused class definition
- **Interactive expansion** to dive into specific files

### Word Search Results
- **File locations** where your search term appears
- **CSS-only detection** to identify potentially unused code
- **Quick insights** into whether code can be safely removed

## Technology Stack

- **Frontend**: Angular 17 with Material Design
- **Backend**: Rust with Tauri v2
- **Styling**: SCSS with CSS custom properties for theming
- **File Dialogs**: Native system dialogs via Tauri plugins

## Why Choose the GUI Version?

| Feature | CLI Version | GUI Version |
|---------|-------------|-------------|
| **Ease of Use** | Command-line knowledge required | Point-and-click interface |
| **Directory Selection** | Manual path typing | Native file browser |
| **Results Viewing** | Terminal output | Interactive visual reports |
| **Theme Support** | Terminal dependent | Built-in light/dark themes |
| **Cross-Platform** | Build required | Standalone executables |
| **Progress Feedback** | Text indicators | Visual progress bars |


## Acknowledgments

- Powered by [Tauri](https://tauri.app/) for cross-platform desktop apps
- UI components from [Angular Material](https://material.angular.io/)

## Issues & Support

Found a bug or have a feature request?

1. Check existing [Issues](../../issues)
2. Create a new issue with:
   - Your operating system and version
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Screenshots if applicable

---

<div align="center">
  <p><strong>Made with ❤️ using Tauri, Angular, and Rust</strong></p>
  <p><em>Happy CSS cleaning!</em></p>
</div>