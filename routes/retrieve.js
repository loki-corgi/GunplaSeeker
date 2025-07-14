//handles retrieving data from database
import express from 'express';
import { getModel, getAllModels } from '../controllers/retrieve.js';

const router = express.Router();
router.post('/model', getModel);
router.post('/listing', getAllModels);