import express from 'express';
import updateRoutes from './update.js';
import retrieveRoutes from './retrieve.js';
import { indexListing, form } from '../controllers/indexController.js';

const router = express.Router();

router.get('/', indexListing);
router.get('/form', form);

router.use('/api/v1', updateRoutes);
router.use('/api/v1', retrieveRoutes)

export default router;