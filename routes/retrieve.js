//handles retrieving data from database
import express from 'express';
import { getModels, getAllModels } from '../controllers/retrieveController.js';

const router = express.Router();
router.get('/getModels', getModels);
router.get('/getListings', getAllModels);

export default router;