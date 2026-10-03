import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  answerQuestionWithGemini,
  explainTopic,
  generateQuiz,
  summarizeText,
  getLearningRecommendations,
} from './src/server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 1. QnA Module - GET & POST /qa (and /api/qa)
const handleQa = async (req: Request, res: Response) => {
  try {
    const question = (req.query.question as string) || req.body?.question;
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Please provide a question.' });
      return;
    }
    const answer = await answerQuestionWithGemini(question.trim());
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: `⚠️ Error in QnA: ${error?.message || error}` });
  }
};
app.get('/qa', handleQa);
app.post('/qa', handleQa);
app.get('/api/qa', handleQa);
app.post('/api/qa', handleQa);

// 2. Explanation Module - POST /explain (and /api/explain)
const handleExplain = async (req: Request, res: Response) => {
  try {
    const topic = req.body?.topic || (req.query.topic as string);
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic.' });
      return;
    }
    const explanation = await explainTopic(topic.trim());
    res.json({ topic: topic.trim(), explanation });
  } catch (error: any) {
    res.status(500).json({ error: `⚠️ Error in Explanation: ${error?.message || error}` });
  }
};
app.post('/explain', handleExplain);
app.get('/explain', handleExplain);
app.post('/api/explain', handleExplain);
app.get('/api/explain', handleExplain);

// 3. Quiz Module - POST /quiz (and /api/quiz)
const handleQuiz = async (req: Request, res: Response) => {
  try {
    const text = req.body?.text || (req.query.text as string);
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Please provide text for quiz.' });
      return;
    }
    const quiz = await generateQuiz(text.trim());
    res.json({ quiz });
  } catch (error: any) {
    res.status(500).json({ error: `⚠️ Error in Quiz: ${error?.message || error}` });
  }
};
app.post('/quiz', handleQuiz);
app.get('/quiz', handleQuiz);
app.post('/api/quiz', handleQuiz);
app.get('/api/quiz', handleQuiz);

// 4. Summarization Module - POST /summarize (and /api/summarize)
const handleSummarize = async (req: Request, res: Response) => {
  try {
    const text = req.body?.text || (req.query.text as string);
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Please provide text to summarize.' });
      return;
    }
    const summary = await summarizeText(text.trim());
    res.json({ summary });
  } catch (error: any) {
    res.status(500).json({ error: `⚠️ Error in Summary: ${error?.message || error}` });
  }
};
app.post('/summarize', handleSummarize);
app.get('/summarize', handleSummarize);
app.post('/api/summarize', handleSummarize);
app.get('/api/summarize', handleSummarize);

// 5. Learning Recommendations Module - GET /learn/recommendations (and /api/learn/recommendations)
const handleLearningPath = async (req: Request, res: Response) => {
  try {
    const topic = (req.query.topic as string) || req.body?.topic;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a topic.' });
      return;
    }
    const recommendation = await getLearningRecommendations(topic.trim());
    res.json({ topic: topic.trim(), recommendation });
  } catch (error: any) {
    res.status(500).json({ error: `⚠️ Error in Learning Path: ${error?.message || error}` });
  }
};
app.get('/learn/recommendations', handleLearningPath);
app.post('/learn/recommendations', handleLearningPath);
app.get('/api/learn/recommendations', handleLearningPath);
app.post('/api/learn/recommendations', handleLearningPath);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'EduGenie Learning Assistant' });
});

// Vite or Static files handling
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EduGenie server running at http://0.0.0.0:${PORT}`);
});
