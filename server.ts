import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const db = new Database('campestre.db');

  // Create Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      farm_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/events', (req, res) => {
    const farmId = req.query.farmId || 'farm_1';
    const stmt = db.prepare('SELECT * FROM events WHERE farm_id = ? ORDER BY timestamp ASC');
    const events = stmt.all(farmId).map((row: any) => ({
      ...row,
      payload: JSON.parse(row.payload)
    }));
    res.json(events);
  });

  app.post('/api/events', (req, res) => {
    const { farmId, userId, type, payload } = req.body;
    
    if (!farmId || !userId || !type || !payload) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO events (id, farm_id, user_id, type, payload) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, farmId, userId, type, JSON.stringify(payload));
    
    res.json({ id, farmId, userId, type, payload, timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    
    // Rota curinga para o React Router funcionar corretamente em produção
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
