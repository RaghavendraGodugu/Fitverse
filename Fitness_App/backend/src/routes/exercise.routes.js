import express from 'express';
import exerciseService from '../services/exercise.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit || 1500;
    const data = await exerciseService.getAllExercises(limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch exercises' });
  }
});

router.get('/bodyPart/:part', async (req, res) => {
  try {
    const data = await exerciseService.getExercisesByBodyPart(req.params.part, req.query.limit || 50);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch exercises by body part' });
  }
});

export default router;
