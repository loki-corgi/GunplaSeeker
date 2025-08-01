//handles retrieving data from database
import express from 'express';
import { getModels, getAllModels } from '../controllers/retrieveController.js';
import { validateQuery } from '../validator/validator.js';


const router = express.Router();
router.get('/listings', validateQuery, getModels);
router.get('/all-listings', getAllModels);

export default router;