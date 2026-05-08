# Notes Manager (DevOps Ready)

A full-stack, DevOps-optimized Notes Manager application built with React, Node.js, and Express.

## 🚀 Features
- **Add Notes**: Create notes with titles and content.
- **Card Layout**: Responsive dark-themed cards for easy management.
- **Search**: Real-time filtering of notes.
- **Important ⭐**: Mark notes as important to highlight them.
- **Delete**: Remove notes with a single click.
- **Smooth Content**: Framer Motion animations for state transitions.

## 🛠️ Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Testing**: Vitest + Supertest
- **Infrastructure**: Docker + GitHub Actions
- **Deployment**: Optimized for Render / Cloud Run

## 📦 Project Structure
```text
notes-devops/
├── .github/workflows/main.yml  # CI/CD Pipeline
├── src/                        # Frontend React Sources
│   ├── App.tsx                 # Main UI
│   └── main.tsx                # Entry Point
├── tests/                      # Vitest Suites
│   └── notes.test.ts           # API Testing
├── server.ts                   # Express Backend & Vite Middleware
├── Dockerfile                  # Multi-stage Container Build
└── dist/                       # Static Assets (Production)
```

## 🛠️ Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Mode** (Express + Vite):
   ```bash
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   npm test
   ```

## 🐳 Docker Commands

**Build Image**:
```bash
docker build -t notes-devops .
```

**Run Container**:
```bash
docker run -p 3000:3000 notes-devops
```

## ⚙️ CI/CD Pipeline
The project uses GitHub Actions (`.github/workflows/main.yml`):
1. **test**: Runs `npm test` on every push/PR.
2. **docker-build**: If tests pass and it's on `main`, builds the image and pushes to Docker Hub (requires `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets).

## 🚀 Deployment (Render)
1. Link your GitHub repository to Render.
2. Choose **Web Service**.
3. Select **Docker** as the runtime.
4. Render will automatically use the `Dockerfile` to build and deploy.

## 🏛️ Architecture
```text
[ Client (React) ] <---> [ Express API ] <---> [ In-Memory Store ]
         ^                   |
         |                   v
   (Vite Middleware)    (dist/index.html)
```
