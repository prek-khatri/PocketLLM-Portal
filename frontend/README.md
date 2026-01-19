# PocketLLM Frontend

React-based frontend for PocketLLM Portal - a lightweight LLM chat application.

---

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Tailwind CSS** - Styling
- **ReactMarkdown** - Markdown rendering with syntax highlighting
- **remark-gfm** - GitHub Flavored Markdown support

---

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── chat/              # Chat interface components
│   │   ├── ChatPage.tsx
│   │   ├── MessageArea/   # Message display and input
│   │   └── Sidebar/       # Session list and controls
│   └── admin/             # Admin dashboard
│       └── AdminDashboard.tsx
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── ChatContext.tsx    # Chat session state
│   └── ThemeContext.tsx   # Dark mode state
├── hooks/                 # Custom React hooks
│   ├── useAuth.tsx
│   ├── useChat.tsx
│   └── useTheme.tsx
├── services/              # API service layer
│   ├── apiClient.ts       # Axios instance
│   ├── authService.ts     # Auth API calls
│   ├── chatService.ts     # Chat API calls
│   ├── adminService.ts    # Admin API calls
│   └── storageService.ts  # LocalStorage utilities
├── types/                 # TypeScript type definitions
│   └── api.ts
├── App.tsx                # Main app component
└── main.tsx               # Entry point
```

---

## Features

### Authentication
- Login/Register forms with validation
- JWT token management
- Protected routes
- Profile management

### Chat Interface
- Real-time streaming responses (SSE)
- Markdown rendering with code syntax highlighting
- Message editing and regeneration
- Copy to clipboard
- Dark mode support

### Session Management
- Create/delete chat sessions
- Rename sessions inline
- Search across chat history
- Export chats (JSON/TXT/Markdown)
- Automatic title generation

### Admin Dashboard
- System statistics
- User management
- Role management
- Session tracking

---

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## Environment Configuration

The frontend expects the backend API to be available at `/api` (proxied by nginx in production).

For local development, update `vite.config.ts` to proxy API requests:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

---

## Key Components

### AuthContext
Manages authentication state, login/logout, and user profile.

### ChatContext
Manages chat sessions, messages, and streaming responses.

### ThemeContext
Manages dark mode preference with localStorage persistence.

### MessageArea
Displays chat messages with markdown rendering, edit functionality, and copy buttons.

### Sidebar
Shows session list, search, profile menu, and admin access.

---

## Styling

The application uses Tailwind CSS with a custom color scheme:

- Primary color: Blue (#2563eb)
- Dark mode support throughout
- Responsive breakpoints for mobile/tablet/desktop

---

## Production Deployment

The production build is served by nginx with the following configuration:
- All static files served from `/usr/share/nginx/html`
- API requests proxied to backend at `/api/*`
- Client-side routing handled with fallback to `index.html`

See `nginx.conf` for full configuration.
