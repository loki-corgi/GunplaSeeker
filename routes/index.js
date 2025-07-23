import express from 'express';
import updateRoutes from './update.js';
import retrieveRoutes from './retrieve.js';
import { indexListing } from '../controllers/indexController.js';

const router = express.Router();

router.get('/', indexListing);

router.use('/api/v1', updateRoutes);
router.use('/api/v1', retrieveRoutes)

export default router;