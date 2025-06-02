# Newsletter Aggregator Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](https://github.com/Ashwin-973/newsletter-aggregator)

> **Declutter your Gmail inbox with intelligent newsletter management, AI-powered insights, and seamless reading experience.**

## 🚀 Overview

Newsletter Aggregator is a powerful Chrome extension that transforms how you manage newsletters in Gmail. Say goodbye to inbox clutter and hello to organized, prioritized newsletter consumption with advanced filtering, bookmark management, and AI-driven content analysis.

## ✨ Features

### 📧 **Smart Newsletter Detection**
- Automatically identifies newsletters using advanced Gmail API queries
- Filters out promotional emails and transactional messages
- Real-time synchronization with your Gmail inbox

### 🎯 **Advanced Filtering & Organization**
- **Date Filters**: Today, Last 7 days, Custom date/time ranges
- **Provider Filters**: Filter by specific newsletter sources
- **Status Filters**: Read, Unread, Bookmarked, Read Later, Incomplete
- **Smart Search**: Find newsletters by content and topics

### 📚 **Reading Management**
- **Bookmark System**: Save important newsletters for quick access
- **Read Later Queue**: Mark newsletters to read when you have time
- **Incomplete Tracking**: Automatically save reading progress and resume where you left off
- **Distraction-Free Reader**: Clean, Gmail-like reading interface

### 🎨 **Intuitive Interface**
- **Context Menus**: Right-click to bookmark or save for later
- **Visual Indicators**: Clear status badges for bookmarked, incomplete, and unread items
- **Responsive Design**: Works seamlessly across different screen sizes
- **Tab Organization**: Main feed, Bookmarks, and Saved items in separate tabs

### 🔒 **Privacy & Security**
- **Read-Only Gmail Access**: Only reads your emails, never modifies or sends
- **Local Storage**: All preferences stored locally on your device
- **Secure Authentication**: OAuth 2.0 with Google's official APIs
- **No Data Collection**: Your email content never leaves your browser

## 🛠️ Installation

### From Chrome Web Store (Recommended)
1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore) (Coming Soon)
2. Click "Add to Chrome"
3. Grant necessary permissions
4. Sign in with your Google account

### Manual Installation (Development)
1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashwin-973/newsletter-aggregator.git
   cd newsletter-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🎯 Quick Start

1. **Sign In**: Click the extension icon and sign in with your Google account
2. **Browse Newsletters**: View your newsletters in the main tab with smart filtering
3. **Organize**: Right-click any newsletter to bookmark or save for later
4. **Read**: Click any newsletter to open in a distraction-free reader
5. **Resume**: Incomplete newsletters automatically save your reading progress

## 📖 Usage Guide

### Managing Newsletters
- **Main Tab**: All newsletters with filtering options
- **Bookmarks Tab**: Newsletters you've marked as important
- **Saved Tab**: Read Later items and incomplete newsletters

### Context Menu Actions
Right-click any newsletter to:
- Add/Remove from Bookmarks
- Add/Remove from Read Later
- View current status indicators

### Reading Experience
- **Auto-mark as Read**: Opens automatically mark newsletters as read in Gmail
- **Progress Tracking**: Newsletters are marked incomplete if you leave before finishing
- **Resume Reading**: Automatically scroll to where you left off
- **Clean Interface**: Distraction-free reading with proper email formatting

### Filtering Options
- **Duration**: Filter by date ranges or custom periods
- **Providers**: Show newsletters from specific senders
- **Status**: View only read, unread, bookmarked, or saved items
- **Reset**: Quickly clear all filters

## 🔧 Technical Details

### Built With
- **Frontend**: React 18, Vite, Tailwind CSS
- **APIs**: Gmail API v1, Chrome Extension APIs
- **Authentication**: OAuth 2.0 with Google Identity Services
- **Storage**: Chrome Local Storage API
- **Security**: DOMPurify for HTML sanitization

### Architecture
```
├── src/
│   ├── components/          # React components
│   ├── api/                # Gmail API integration
│   ├── auth/               # Authentication logic
│   ├── lib/                # Utilities and storage
│   └── background.js       # Service worker
├── public/                 # Static assets
└── dist/                   # Built extension
```

### Permissions Required
- `gmail.readonly`: Read email content
- `gmail.modify`: Mark emails as read
- `storage`: Save preferences locally
- `identity`: Google OAuth authentication
- `tabs`: Open reader in new tabs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Build and test: `npm run build`
6. Submit a pull request

### Reporting Issues
- Use the [GitHub Issues](https://github.com/Ashwin-973/newsletter-aggregator/issues) page
- Include browser version, extension version, and steps to reproduce
- Check existing issues before creating new ones

## 📊 Roadmap

### Version 0.2.0 (Coming Soon)
- [ ] AI-powered newsletter summaries
- [ ] Topic extraction and categorization
- [ ] Smart notification system
- [ ] Export/import functionality

### Version 0.3.0 (Future)
- [ ] Newsletter analytics and reading stats
- [ ] Custom themes and layouts
- [ ] Integration with read-later services
- [ ] Mobile companion app

## 🐛 Known Issues

- Large newsletters may take longer to load in reader view
- Some newsletter formats may not display perfectly
- Context menu may not appear on first right-click (refresh fixes this)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Gmail API for robust email access
- React and Vite communities for excellent tooling
- Chrome Extensions documentation and examples
- Open source contributors and testers

## 📞 Support

- **Documentation**: [Wiki](https://github.com/Ashwin-973/newsletter-aggregator/wiki)
- **Issues**: [GitHub Issues](https://github.com/Ashwin-973/newsletter-aggregator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ashwin-973/newsletter-aggregator/discussions)
- **Email**: [ashwin.newsletter@gmail.com](mailto:ashwin.newsletter@gmail.com)

## 🌟 Show Your Support

If this project helps you manage your newsletters better, please:
- ⭐ Star this repository
- 🐛 Report bugs and suggest features
- 🤝 Contribute to the codebase
- 📢 Share with others who might benefit

---

**Made with ❤️ by [Ashwin](https://github.com/Ashwin-973)**

*Transform your newsletter reading experience today!*
```

## **10. CREATE CONTRIBUTING.MD**

```markdown:CONTRIBUTING.md
# Contributing to Newsletter Aggregator

Thank you for your interest in contributing to Newsletter Aggregator! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Chrome browser
- Basic knowledge of React, JavaScript, and Chrome Extensions
- Gmail account for testing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/newsletter-aggregator.git
   cd newsletter-aggregator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Build**
   ```bash
   npm run dev
   ```

4. **Load Extension**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Load unpacked from `dist` folder

5. **Test Changes**
   - Make your changes
   - Run `npm run build`
   - Reload extension in Chrome
   - Test functionality

## 📋 How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
- Check existing issues to avoid duplicates
- Test with the latest version
- Verify the issue isn't browser-specific

**Bug Report Template:**
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Chrome Version: 
- Extension Version:
- OS:

**Screenshots**
If applicable
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Screenshots, mockups, examples
```

### Code Contributions

#### Types of Contributions Welcome
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage improvements

#### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Changes**
   - Follow coding standards (see below)
   - Add tests if applicable
   - Update documentation
   - Test thoroughly

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add newsletter search functionality"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create PR on GitHub
   - Fill out PR template
   - Link related issues

#### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(popup): add context menu for bookmarking
fix(reader): resolve scroll position saving issue
docs(readme): update installation instructions
style(components): format code with prettier
```

## 🏗️ Project Structure

```
newsletter-aggregator/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Popup.jsx       # Main popup interface
│   │   ├── ReaderView.jsx  # Newsletter reader
│   │   └── ContextMenu.jsx # Right-click menu
│   ├── api/                # API integrations
│   │   └── gmail.js        # Gmail API functions
│   ├── auth/               # Authentication
│   │   └── auth.js         # OAuth handling
│   ├── lib/                # Utilities
│   │   ├── storage.js      # Storage utilities
│   │   └── utils.js        # Helper functions
│   ├── hooks/              # Custom React hooks
│   ├── background.js       # Service worker
│   ├── content.js          # Content script
│   └── manifest.json       # Extension manifest
├── public/                 # Static assets
├── dist/                   # Built extension
└── docs/                   # Documentation
```

## 💻 Coding Standards

### JavaScript/React
- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Handle errors gracefully

### Code Style
```javascript
// Good
const fetchNewsletters = async (token, options = {}) => {
  try {
    const response = await gmailApi.getMessages(token, options);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch newsletters:', error);
    throw new Error('Newsletter fetch failed');
  }
};

// Bad
const fetch = async (t, o) => {
  const r = await gmailApi.getMessages(t, o);
  return r.data;
};
```

### React Components
```jsx
// Good
export function NewsletterItem({ newsletter, onBookmark, onReadLater }) {
  const handleClick = useCallback(() => {
    // Handle click logic
  }, [newsletter.id]);

  return (
    <div className="newsletter-item" onClick={handleClick}>
      <h3>{newsletter.subject}</h3>
      <p>{newsletter.from}</p>
    </div>
  );
}

// Bad
export function NewsletterItem(props) {
  return (
    <div onClick={() => console.log('clicked')}>
      <h3>{props.newsletter.subject}</h3>
    </div>
  );
}
```

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Maintain consistent spacing and typography

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Authentication works correctly
- [ ] Newsletters display properly
- [ ] Filtering functions work
- [ ] Context menu appears and functions
- [ ] Reader view displays content correctly
- [ ] Bookmark/Read Later functionality works
- [ ] Incomplete tracking saves progress
- [ ] Storage persists across sessions

### Adding Tests
```javascript
// Example test structure
describe('Newsletter Storage', () => {
  test('should save newsletter to bookmarks', async () => {
    const newsletter = { id: '123', subject: 'Test' };
    await updateNewsletterInStorage('123', { bookmark: true });
    
    const saved = await getNewsletterFromStorage('123');
    expect(saved.bookmark).toBe(true);
  });
});
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain Chrome Extension specific code
- Update README for new features

### API Documentation
```javascript
/**
 * Fetches newsletters from Gmail API
 * @param {string} token - OAuth access token
 * @param {Object} options - Query options
 * @param {string} options.query - Gmail search query
 * @param {number} options.maxResults - Maximum results to return
 * @returns {Promise<Array>} Array of newsletter objects
 * @throws {Error} When authentication fails
 */
export async function fetchNewslettersFromGmail(token, options = {}) {
  // Implementation
}
```

## 🔍 Review Process

### What We Look For
- ✅ Code follows project standards
- ✅ Feature works as described
- ✅ No breaking changes
- ✅ Tests pass (if applicable)
- ✅ Documentation updated
- ✅ Performance considerations
- ✅ Security implications reviewed

### Review Timeline
- Initial review: 2-3 days
- Follow-up reviews: 1-2 days
- Merge: After approval from maintainers

## 🎯 Areas Needing Help

### High Priority
- [ ] AI integration for newsletter summaries
- [ ] Performance optimization for large inboxes
- [ ] Better error handling and user feedback
- [ ] Accessibility improvements

### Medium Priority
- [ ] Unit and integration tests
- [ ] Internationalization (i18n)
- [ ] Advanced filtering options
- [ ] Newsletter analytics

### Low Priority
- [ ] Custom themes
- [ ] Export functionality
- [ ] Integration with other services

## 🆘 Getting Help

### Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Communication
- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: ashwin.newsletter@gmail.com for sensitive matters

### Mentorship
New contributors are welcome! We're happy to:
- Help you find good first issues
- Review your code and provide feedback
- Explain project architecture
- Guide you through the contribution process

## 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes
- Invited to join the core team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Newsletter Aggregator! 🚀**

*Every contribution, no matter how small, makes a difference.*
