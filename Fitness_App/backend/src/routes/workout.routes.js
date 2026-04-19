import express from 'express';
// We would import controllers here once the DB is hooked up
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Fetch all workouts for user placeholder' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create new workout for user placeholder' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update workout ${req.params.id} placeholder` });
});

export default router;
