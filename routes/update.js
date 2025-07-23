//handles updating collection in database
import express from 'express';
import { addModel } from '../controllers/updateController.js';

const router = express.Router();
router.post('/add-Model', addModel);

export default router;