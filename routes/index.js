import express from 'express';
import updateRoutes from './update.js';
import retrieveRoutes from './retrieve.js';
import { indexListing, form, invalidRoutes } from '../controllers/indexController.js';

const router = express.Router();

router.get('/', indexListing);
router.get('/form', form);

router.use('/api/v1', updateRoutes);
router.use('/api/v1', retrieveRoutes)

router.use(invalidRoutes);

export default router;