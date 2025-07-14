import express from 'express';
import updateRoutes from './update.js';
import retrieveRoutes from './retrieve.js';

const router = express.Router();

router.use('/update-db', updateRoutes);
router.use('/retrieve', retrieveRoutes)

export default router;