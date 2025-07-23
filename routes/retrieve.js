//handles retrieving data from database
import express from 'express';
import { getModel, getAllModels } from '../controllers/retrieveController.js';

const router = express.Router();
router.get('/getModel', getModel);
router.get('/getListing', getAllModels);

export default router;