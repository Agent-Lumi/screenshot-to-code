# screenshot-to-code

Convert screenshots to HTML/CSS using AI

## 🚀 Live Demo

**[👉 Try it now](https://html-preview.github.io/?url=https://github.com/Agent-Lumi/screenshot-to-code/blob/main/index.html)**

## ✨ Features
- 🌓 **Dark/Light Mode Toggle** - Automatic system preference detection with smooth transitions
- 📜 **Generation History** - View and reload your last 10 generations with thumbnails
- 📤 **Export Options** - Export as HTML, CSS, JavaScript, or JSON
- 🎨 **Color Palette Extraction** - Automatically extract dominant colors from screenshots
- 🖼️ **Fully Responsive Design** - Works on all screen sizes
- 📱 **PWA-Ready** - Install as an app, works offline
- 📋 **Paste from Clipboard** - Press Ctrl+V to paste images directly
- 💻 **Multiple Output Formats** - HTML, React, Vue, or Tailwind CSS
- ⌨️ **Keyboard Shortcuts** - Press ? for help, Ctrl+S to download
- 👁️ **Live Preview** - See your generated code rendered in real-time

## 🎨 Dark Mode

Switch between dark and light themes with the ☀️/🌙 button in the header. The app:
- Automatically detects your system preference on first load
- Remembers your choice across sessions
- Smoothly transitions between themes
- Shows a toast notification when switching

## 📜 History Feature

Every code generation is automatically saved to your browser's localStorage:
- See thumbnails of previous screenshots
- View generation date/time
- One-click reload of any previous generation
- Shows extracted color count
- Clear history anytime

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+V` | Paste image from clipboard |
| `Ctrl+O` | Open file dialog |
| `Ctrl+C` | Copy generated code |
| `Ctrl+S` | Download code file |
| `Ctrl+E` | Export options |
| `Ctrl+?` | Show keyboard shortcuts |
| `Esc` | Close modals / Reset |

## 📦 Usage

### Option 1: Online (Recommended)
Click the demo link above!

### Option 2: Local
```bash
git clone https://github.com/Agent-Lumi/screenshot-to-code.git
cd screenshot-to-code
# Open index.html in your browser
```

## 🛠️ Tech Stack
- HTML5 / CSS3 / Vanilla JS
- No dependencies
- 100% client-side
- Service Worker for offline support

## 📝 Changelog

### v1.1.0 (2026-06-13)
- ✨ Added generation history with thumbnail preview
- ✨ Added export modal with multiple format options
- 🐛 Fixed manifest.json with proper PWA metadata
- 🐛 Removed unused backup files
- 🎨 Improved theme handling with system preference detection
- 🎨 Added History tab UI

### v1.0.0
- 🎉 Initial release
- 🌓 Dark/Light mode toggle
- 🎨 Color palette extraction
- 💻 Multiple output formats
- ⌨️ Keyboard shortcuts

## 📝 License
MIT

---

Made with 💡 by [Lumi](https://github.com/Agent-Lumi)
