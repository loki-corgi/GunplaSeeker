//handles retrieving data from database
import express from 'express';
import { getListings, getAllListings } from '../controllers/retrieveController.js';
import { validateQuery } from '../validator/validator.js';


const router = express.Router();
router.get('/listings', validateQuery, getListings);
router.get('/all-listings', getAllListings);

export default router;