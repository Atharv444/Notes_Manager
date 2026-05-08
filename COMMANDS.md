# 📋 Notes Manager — Commands Reference

## Prerequisites

- **Node.js** >= 20 ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Docker Desktop** (optional, for containerized deployment)
- **Git** (for version control)

---

## 🚀 Getting Started (First Time Setup)

```bash
# Clone the repository
git clone https://github.com/Atharv444/Notes_Manager.git
cd Notes_Manager

# Install dependencies
npm install
```

---

## 💻 Local Development

```bash
# Start the dev server (frontend + backend with hot reload)
npm run dev
```

> Opens at **http://localhost:3000**

---

## 🧪 Testing

```bash
# 1. Ensure all development dependencies are installed
npm install

# 2. Run all tests
npm test
```

---

## 🔨 Production Build

```bash
# Build frontend (Vite) + backend (TypeScript)
npm run build

# Run the production server
npm start
```

> Serves at **http://localhost:3000**

---

## 🧹 Utility Commands

```bash
# Type-check without emitting files
npm run lint

# Remove build output folders (dist/ and dist-server/)
npm run clean
```

---

## 🐳 Docker

### Build the Docker Image

```bash
docker build -t notes-devops .
```

### Run the Container

```bash
# Run in foreground
docker run -p 3000:3000 notes-devops

# Run in background (detached)
docker run -d -p 3000:3000 --name notes-app notes-devops
```

> Opens at **http://localhost:3000**

### Manage Containers

```bash
# List running containers
docker ps

# Stop a running container
docker stop notes-app

# Stop ALL running containers
docker stop $(docker ps -q)

# Remove a stopped container
docker rm notes-app

# View container logs
docker logs notes-app
```

### Manage Images

```bash
# List all images
docker images

# Remove the image
docker rmi notes-devops
```

### Rebuild After Code Changes

```bash
docker stop notes-app
docker rm notes-app
docker build -t notes-devops .
docker run -d -p 3000:3000 --name notes-app notes-devops
```

---

## 📦 Git & GitHub

```bash
# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull
```

---

## ⚙️ CI/CD (GitHub Actions)

The CI/CD pipeline runs automatically on every push/PR to `main`:

1. **Test Job** — Installs dependencies and runs `npm test`
2. **Docker Build Job** — Builds the Docker image to verify Dockerfile works

> Pipeline config: `.github/workflows/main.yml`

---

## 🌐 Vercel Deployment

The project auto-deploys to Vercel on push to `main`.

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 📁 Project Structure

```
Notes_Manager/
├── src/                  # React frontend source
│   ├── index.css         # Tailwind CSS entry
│   └── ...
├── server.ts             # Express backend server
├── vite.config.ts        # Vite build configuration
├── Dockerfile            # Multi-stage Docker build
├── package.json          # Dependencies & scripts
├── .github/workflows/    # CI/CD pipeline
│   └── main.yml
└── dist/                 # Built frontend (after npm run build)
```
