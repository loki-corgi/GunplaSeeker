//handles retrieving data from database
import express from 'express';
import { getModels, getAllModels } from '../controllers/retrieveController.js';

const router = express.Router();
router.get('/listings', getModels);
router.get('/all-listings', getAllModels);

export default router;