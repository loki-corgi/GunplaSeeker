//handles retrieving data from database
import express from 'express';
import { getModel, getAllModels } from '../controllers/retrieve.js';

const router = express.Router();
router.get('/model', getModel);
router.get('/listing', getAllModels);

export default router;