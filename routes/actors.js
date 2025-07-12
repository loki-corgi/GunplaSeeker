import express from 'express';
import { addActor } from '../controllers/actorsControllers.js'

const router = express.Router();

router.post('/', addActor);

export default router;