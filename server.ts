import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Liga o backend ao Supabase usando as chaves injetadas pelo Google Cloud
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Busca os dados diretamente do Supabase filtrando pelo utilizador
  app.get('/api/events', async (req, res) => {
    const farmId = req.query.farmId || 'farm_1';
    const userId = req.query.userId; 

    if (!userId) {
      return res.json([]); 
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('farm_id', farmId)
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    const events = data.map((row: any) => ({
      ...row,
      // O Supabase já envia o JSONB pronto, mas garantimos o formato aqui
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload
    }));
    
    res.json(events);
  });

  // Guarda os dados diretamente no Supabase
  app.post('/api/events', async (req, res) => {
    const { farmId, userId, type, payload } = req.body;
    
    if (!farmId || !userId || !type || !payload) {
      return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    const id = uuidv4();
    
    const { error } = await supabase
      .from('events')
      .insert([
        {
          id,
          farm_id: farmId,
          user_id: userId,
          type,
          payload: payload // No Supabase com JSONB não precisamos de JSON.stringify
        }
      ]);

    if (error) {
      console.error('Erro ao inserir evento no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao guardar os dados' });
    }
    
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
    
    // Rota curinga para o React Router funcionar corretamente
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on porta ${PORT}`);
  });
}

startServer();
