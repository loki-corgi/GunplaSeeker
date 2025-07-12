import express from 'express';
import { addShow, getShowsJSON } from '../controllers/showsControllers.js'

const router = express.Router();

router.post('/', addShow);
router.get('/', getShowsJSON);

export default router;