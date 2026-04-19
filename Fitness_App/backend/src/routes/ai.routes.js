import express from 'express';
import aiService from '../services/ai.service.js';

const router = express.Router();

// Mock middleware to extract user from token
const authMock = (req, res, next) => {
  req.user = { id: 'mock-user-123' }; // Simulate JWT extraction
  next();
};

router.post('/chat', authMock, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const aiResponse = await aiService.generateResponse(query, req.user.id);
    res.json({ success: true, data: aiResponse });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
