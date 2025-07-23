//handles retrieving data from database
import express from 'express';
import { getModels, getAllModels } from '../controllers/retrieveController.js';

const router = express.Router();
router.get('/get-models', getModels);
router.get('/get-listings', getAllModels);

export default router;