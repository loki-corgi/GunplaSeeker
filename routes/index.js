import express from 'express';
import actorsRoutes from '../routes/actors.js';
import showsRoutes from '../routes/shows.js';

const router = express.Router();

router.use('/actors', actorsRoutes);
router.use('/shows', showsRoutes)

export default router;