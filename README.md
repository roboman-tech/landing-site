# DeepSeek Chatbot Frontend

A modern, responsive React + TypeScript frontend for the DeepSeek Chatbot application. Built with Vite for fast development and optimized production builds.

## Features

- **ChatGPT-style UI**: Clean, modern chat interface with smooth animations
- **Real-time Chat**: Send and receive messages from the DeepSeek AI model
- **Message History**: Persistent chat history stored in browser localStorage
- **Auto-scrolling**: Automatically scrolls to the latest message
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during message processing
- **Auto-resizing Textarea**: Input field grows as you type
- **Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new line
- **Configurable Server URL**: Easy backend endpoint configuration via environment variables

## Tech Stack

- **React 19.2.0**: UI library
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Vite 8.0**: Fast build tool and dev server
- **Axios 1.13.5**: HTTP client for API requests
- **ESLint 9.39.1**: Code linting

## Installation

### Prerequisites
- Node.js 16+ and npm (or yarn)

### Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Configure the backend URL in `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Development

### Run Development Server

```bash
npm run dev
```

This starts Vite's development server with hot module reloading (HMR). Open your browser to the URL displayed in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Locally preview the production build.

### Run Linter

```bash
npm run lint
```

Run ESLint to check for code quality issues.

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Root app component with state management
│   ├── App.css              # Main styles (ChatGPT-style)
│   ├── Chatbot.tsx          # Chat input component
│   ├── ChatHistory.tsx      # Message display component
│   ├── config.ts            # Configuration management
│   ├── main.tsx             # React app entry point
│   ├── index.css            # Global styles
│   └── assets/              # Static assets
├── public/                  # Public static files
├── index.html               # HTML entry point
├── .env                     # Environment variables (local)
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## Configuration

### Environment Variables

Configure your backend server URL by editing `.env`:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Available options:**
- **Local Development**: `http://127.0.0.1:8000`
- **Production**: `https://api.yourdomain.com`

The frontend automatically uses the configured URL for all API requests.

## Component Architecture

### App.tsx
- Main application component
- Manages message state and localStorage persistence
- Coordinates ChatHistory and Chatbot components
- Handles chat history clearing functionality

### ChatHistory.tsx
- Displays chat messages in reverse chronological order
- Auto-scrolls to latest message
- Shows empty state welcome message
- Message bubbles with different styling for user vs bot

### Chatbot.tsx
- Handles user input and message submission
- Auto-resizes textarea based on content
- Manages loading states and error handling
- Sends messages to backend API via axios

### config.ts
- Centralized configuration management
- Reads API URL from environment variables
- Provides fallback defaults

## API Integration

The frontend communicates with the backend via:

**Endpoint**: `POST {VITE_API_BASE_URL}/chat`

**Request Body**:
```json
{
  "content": "Your message here"
}
```

**Response**:
```json
{
  "reply": "Bot response here"
}
```

## Troubleshooting

### Cannot connect to backend
- Verify the backend server is running on the configured URL
- Check the `VITE_API_BASE_URL` in `.env` matches your backend URL
- Check browser console for CORS errors
- Ensure backend has CORS middleware enabled

### Messages not persisting
- Check if localStorage is enabled in your browser
- Check browser DevTools > Application > Local Storage
- Clear browser cache and reload if needed

### Vite dev server not working
- Make sure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Try clearing npm cache: `npm cache clean --force`

### Build fails
- Ensure TypeScript compilation passes: `npx tsc --noEmit`
- Check for syntax errors in your code
- Verify all imports are correct

## Performance Optimization

- Code splitting via Vite
- Minification and tree-shaking in production
- Lazy loading of routes (can be added)
- Optimized CSS with proper scoping
- ESLint rules to prevent performance issues

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

To contribute to the frontend:

1. Follow the existing code style
2. Run `npm run lint` before committing
3. Test changes in both development and production builds
4. Update documentation if adding new features

## License

This project is part of the DeepSeek Chatbot application.

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
