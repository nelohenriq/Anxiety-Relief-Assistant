import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './db/index';
import { users, plans, moodLogs, journalEntries, exerciseLogs } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import * as aiService from './server/aiService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // AI Generation
  app.post('/api/ai/plan', async (req, res) => {
    try {
      const result = await aiService.generatePlan(req.body);
      res.json(result);
    } catch (error) {
      console.error('AI Plan Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
    }
  });

  app.post('/api/ai/for-you', async (req, res) => {
    try {
      const result = await aiService.generateForYou(req.body);
      res.json({ suggestion: result });
    } catch (error) {
      console.error('AI For You Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
    }
  });

  app.post('/api/ai/analyze-journal', async (req, res) => {
    try {
      const result = await aiService.analyzeJournal(req.body);
      res.json({ analysis: result });
    } catch (error) {
      console.error('AI Journal Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
    }
  });

  app.post('/api/ai/quotes', async (req, res) => {
    try {
      const result = await aiService.generateMotivationalQuotes(req.body);
      res.json({ quotes: result });
    } catch (error) {
      console.error('AI Quotes Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
    }
  });

  app.post('/api/ai/challenge-thought', async (req, res) => {
    try {
      const result = await aiService.generateThoughtChallengeHelp(req.body);
      res.json({ help: result });
    } catch (error) {
      console.error('AI Challenge Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
    }
  });

  app.get('/api/ai/ollama-models', async (req, res) => {
    try {
      const results = { local: [] as string[], cloud: [] as string[] };
      
      // Try local Ollama
      try {
        const localResp = await fetch('http://localhost:11434/api/tags');
        if (localResp.ok) {
          const data: any = await localResp.json();
          results.local = data.models?.map((m: any) => m.name) || [];
        }
      } catch (e) {
        // Local not running or not accessible
      }

      // Default cloud models
      results.cloud = ['llama3', 'mistral', 'phi3', 'gemma'];
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  // User Profile
  app.get('/api/users/:id', async (req, res) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.params.id) });
    if (user) {
      res.json({ ...user, profile: JSON.parse(user.profile) });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/users', async (req, res) => {
    const { id, profile, consentLevel } = req.body;
    const now = new Date().toISOString();
    await db.insert(users).values({
      id,
      profile: JSON.stringify(profile),
      consentLevel,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: users.id,
      set: { profile: JSON.stringify(profile), consentLevel, updatedAt: now }
    });
    res.json({ success: true });
  });

  // Helper to ensure user exists (prevents foreign key errors)
  const ensureUser = async (userId: string) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      const now = new Date().toISOString();
      await db.insert(users).values({
        id: userId,
        profile: JSON.stringify({}),
        consentLevel: 'essential',
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  // Mood Logs
  app.get('/api/users/:userId/moods', async (req, res) => {
    const logs = await db.select().from(moodLogs)
      .where(eq(moodLogs.userId, req.params.userId))
      .orderBy(desc(moodLogs.timestamp));
    res.json(logs);
  });

  app.post('/api/users/:userId/moods', async (req, res) => {
    try {
      await ensureUser(req.params.userId);
      const { id, rating, timestamp } = req.body;
      await db.insert(moodLogs).values({
        id,
        userId: req.params.userId,
        rating,
        timestamp,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Save Mood Error:', error);
      res.status(500).json({ error: 'Failed to save mood log' });
    }
  });

  // Journal
  app.get('/api/users/:userId/journal', async (req, res) => {
    const results = await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, req.params.userId))
      .orderBy(desc(journalEntries.timestamp));
    res.json(results);
  });

  app.post('/api/users/:userId/journal', async (req, res) => {
    try {
      await ensureUser(req.params.userId);
      const { id, text, timestamp } = req.body;
      await db.insert(journalEntries).values({
        id,
        userId: req.params.userId,
        text,
        timestamp,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Save Journal Error:', error);
      res.status(500).json({ error: 'Failed to save journal entry' });
    }
  });

  // Plan History
  app.get('/api/users/:userId/plans', async (req, res) => {
    const results = await db.select().from(plans)
      .where(eq(plans.userId, req.params.userId))
      .orderBy(desc(plans.timestamp));
    res.json(results.map(p => ({
      ...p,
      generatedExercises: JSON.parse(p.generatedExercises),
      sources: p.sources ? JSON.parse(p.sources) : []
    })));
  });

  app.post('/api/users/:userId/plans', async (req, res) => {
    try {
      await ensureUser(req.params.userId);
      const { id, timestamp, userInput, generatedExercises, sources, calmImageUrl } = req.body;
      await db.insert(plans).values({
        id,
        userId: req.params.userId,
        timestamp,
        userInput,
        generatedExercises: JSON.stringify(generatedExercises),
        sources: JSON.stringify(sources || []),
        calmImageUrl,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Save Plan Error:', error);
      res.status(500).json({ error: 'Failed to save plan history' });
    }
  });

  // Exercise Logs
  app.post('/api/users/:userId/exercise-logs', async (req, res) => {
    try {
      await ensureUser(req.params.userId);
      const { id, exerciseId, exerciseTitle, completedAt, rating } = req.body;
      await db.insert(exerciseLogs).values({
        id: id || crypto.randomUUID(),
        userId: req.params.userId,
        exerciseId,
        exerciseTitle,
        completedAt,
        rating,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Save Exercise Log Error:', error);
      res.status(500).json({ error: 'Failed to save exercise log' });
    }
  });
  
  app.post('/api/users/:userId/feedback', async (req, res) => {
    try {
      await ensureUser(req.params.userId);
      const { id, timestamp, type, message } = req.body;
      await db.insert(appFeedback).values({
        id: id || crypto.randomUUID(),
        userId: req.params.userId,
        timestamp,
        type,
        message,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Save Feedback Error:', error);
      res.status(500).json({ error: 'Failed to save feedback' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for any path that's not an API route
    app.get('*', (req, res) => {
      // If it's an API route that somehow reached here, return a 404 JSON instead of HTML
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
