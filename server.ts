import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface Note {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: string;
  folder: string;
  status: 'active' | 'archived' | 'trash';
}

// In-memory storage (exposed for tests if needed, or kept private)
let notes: Note[] = [];

export const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Exported for testing reset
export const resetNotes = () => { notes = []; };

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.get('/api/notes', (req, res) => {
  const { status } = req.query;
  if (status) {
    return res.json(notes.filter(n => n.status === status));
  }
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const { title, body, important, folder } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }
  const newNote: Note = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    body,
    important: !!important,
    createdAt: new Date().toISOString(),
    folder: folder || 'General',
    status: 'active'
  };
  notes.push(newNote);
  res.status(201).json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = notes.length;
  notes = notes.filter(n => n.id !== id);
  if (notes.length === initialLength) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(200).json({ message: 'Note deleted permanently' });
});

app.patch('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = notes.find(n => n.id === id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  if (req.body.status) {
    note.status = req.body.status;
  } else {
    note.important = !note.important;
  }
  res.json(note);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}
