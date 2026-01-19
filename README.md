# PocketLLM Portal

A lightweight, CPU-only web application for LLM inference built with React and FastAPI.

**Authors:** Ayush Shah, Dhruv Kudalkar, Vraj Desai, Prateek Ranka, Preksha Khatri, Aditya Jaiswal, Tanmay Thakare

---

## Architecture Overview

This project implements a **three-tier Single Page Application (SPA)** architecture with:

- **Frontend:** React 19 + TypeScript + Vite + nginx
- **Backend:** FastAPI (Python) for business logic and authentication
- **LLM Server:** llama.cpp native server (OpenAI-compatible API)
- **Database:** SQLite
- **Deployment:** Docker + Docker Compose

### Architecture Flow

```
User Browser
    ↓
nginx (Frontend - Port 80)
    ↓
FastAPI Backend (Port 8000)
    ↓
llama.cpp Server (Port 8080)
    ↓
Phi-3.5 Mini Instruct Model (3.8B)
```

**Benefits of this architecture:**
- **Separation of concerns**: Frontend, business logic, and inference are decoupled
- **Scalability**: Each service can be scaled independently
- **Performance**: Native llama.cpp server is faster than Python bindings
- **Maintainability**: Smaller, focused services are easier to maintain
- **Flexibility**: Easy to swap models or inference engines

---

## Key Features

**Authentication & User Management:**
- JWT-based authentication with secure password hashing
- User registration and login
- User profile management (update username, email, password)
- Admin dashboard with user management
- Role-based access control (admin/user roles)

**Chat Features:**
- Real-time streaming chat interface with Server-Sent Events (SSE)
- Phi-3.5 Mini Instruct model (3.8B) with reduced hallucination
- Session management with automatic title generation
- Chat history persistence with SQLite database
- Edit and regenerate messages
- Copy AI responses to clipboard
- Rename chat sessions inline
- Search across chat history (title and content)
- Export chats (JSON, TXT, Markdown formats)
- Delete individual chat sessions

**Admin Features:**
- System statistics dashboard (users, sessions, activity)
- User management (activate/deactivate users)
- Role management (promote/demote admins)
- Delete users with safety checks
- Session count tracking per user

**UI/UX:**
- Dark mode support with theme toggle
- Responsive design for mobile and desktop
- Real-time typing indicators
- Message timestamps
- Markdown rendering for AI responses
- Syntax highlighting for code blocks

---

## Prerequisites

- Docker and Docker Compose installed
- At least 16GB RAM available
- 4 CPU cores recommended
- ~5GB disk space (including model)

---

## Quick Start Guide

### 1. Download the LLM Model

Download the Phi-3.5 Mini Instruct Q4 K_M GGUF model (recommended for reduced hallucination):

```bash
mkdir -p models

wget -O models/phi-3.5-mini-instruct-q4_k_m.gguf \
  https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf
```

**Note:**
- Phi-3.5 Mini (3.8B): ~2.2GB download, better factual accuracy
- Update `docker-compose.yml` if using a different model

### 2. Configure Environment (Optional)

```bash
cp .env.example .env
nano .env
```

### 3. Build and Run with Docker

```bash
docker compose up --build
```

Or run in detached mode:

```bash
docker compose up --build -d
```

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost
```

Backend API documentation is available at:

```
http://localhost:8000/docs
```

---

## Running the Docker Image

### Start Services

```bash
docker compose up -d
```

### Stop Services

```bash
docker compose down
```

### View Logs

```bash
docker compose logs -f
```

### Rebuild After Code Changes

```bash
docker compose up --build -d
```

### Create Admin User

```bash
docker exec pocketllm-backend python -c "from app.db.database import SessionLocal; from app.db.models import User; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(username='admin', email='admin@pocketllm.com', hashed_password=get_password_hash('admin123'), is_admin=True, is_active=True); db.add(admin); db.commit(); print('Admin user created: username=admin, password=admin123'); db.close()"
```

---

## Usage

### First-Time Setup

1. **Register an Account**
   - Click "Register" on the login page
   - Enter username, email, and password
   - You'll be automatically logged in

2. **Start Chatting**
   - Click "New Chat" to create a session
   - Type your message and press "Send"
   - Watch the AI response stream in real-time
   - Edit messages by clicking the "Edit" button
   - Copy AI responses using the "Copy" button

3. **Manage Sessions**
   - View all your chat sessions in the sidebar
   - Click on a session to load it
   - Rename sessions by clicking the pencil icon
   - Search chats using the search box
   - Export chats in JSON, TXT, or Markdown format
   - Delete sessions you no longer need
   - Toggle dark mode using the theme button

4. **Admin Dashboard** (for admin users)
   - Access via "Admin Dashboard" button in sidebar
   - View system statistics
   - Manage users (activate/deactivate, promote/demote)
   - Delete users with safety checks
   - Monitor session activity

---

## Project Structure

```
PocketLLM/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/      # API routes (auth, chat, admin)
│   │   │   └── models/         # Pydantic schemas
│   │   ├── core/               # Config & security
│   │   ├── db/                 # Database models
│   │   └── services/           # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # Context providers (Auth, Chat, Theme)
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── models/                      # LLM model files
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite (build tool)
- React Router v6
- Axios (HTTP client)
- Context API (state management)
- ReactMarkdown (markdown rendering)
- Tailwind CSS (styling)

### Backend
- Python 3.11
- FastAPI (async web framework)
- SQLAlchemy (ORM)
- httpx (async HTTP client)
- JWT authentication (python-jose + bcrypt)
- Pydantic (validation)
- Server-Sent Events (SSE) for streaming

### LLM Server
- llama.cpp native server
- OpenAI-compatible API
- Phi-3.5 Mini Instruct model (3.8B)
- CPU-only inference

### Infrastructure
- Docker & Docker Compose
- nginx (reverse proxy & static file server)
- SQLite (database)

---

## API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile

**Chat:**
- `POST /api/chat/inference` - Generate LLM response (non-streaming)
- `POST /api/chat/inference/stream` - Generate streaming LLM response (SSE)
- `POST /api/chat/inference/save-partial` - Save partial response when stopped
- `GET /api/chat/sessions` - List all user sessions
- `GET /api/chat/sessions/{id}` - Get session with messages
- `POST /api/chat/sessions` - Create new session
- `PATCH /api/chat/sessions/{id}` - Rename session
- `DELETE /api/chat/sessions/{id}` - Delete session
- `GET /api/chat/sessions/{id}/messages` - Get all messages in session
- `GET /api/chat/sessions/{id}/export` - Export session (JSON/TXT/MD)
- `GET /api/chat/search` - Search sessions by title or content

**Admin:**
- `GET /api/admin/users` - Get all users with session counts
- `GET /api/admin/users/{id}` - Get specific user details
- `PUT /api/admin/users/{id}` - Update user status/role
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/stats` - Get system statistics

---

## Docker Resource Configuration

The `docker-compose.yml` sets the following resource limits:

- **Backend**: 4 CPUs, 12GB Memory
- **Frontend**: 1 CPU, 512MB Memory
- **Total**: 4 CPUs, 12.5GB Memory

These can be adjusted in `docker-compose.yml` if needed.

---

## Troubleshooting

### Model Not Found Error

Ensure the model file is in the `./models/` directory and the filename matches the configuration in `docker-compose.yml`.

### Out of Memory Errors

- Ensure your system has at least 16GB RAM
- Close other applications
- Adjust resource limits in `docker-compose.yml`

### Port Already in Use

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Instead of "80:80"
```

### Permission Errors (Linux)

```bash
sudo chmod -R 755 ./models
sudo chown -R $USER:$USER ./models
```

---

## Development

### Running Services Separately

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

---

## Additional Features

**Implemented Beyond MVP:**
- Server-Sent Events (SSE) streaming for real-time responses
- Admin dashboard with full user management
- Dark mode with persistent theme preferences
- Chat search functionality
- Export chat feature (multiple formats)
- Inline chat renaming
- Message editing and regeneration
- Copy to clipboard functionality
- Safety checks for admin operations

---

## Acknowledgments

- Phi-3.5 model by Microsoft
- llama.cpp by Georgi Gerganov
