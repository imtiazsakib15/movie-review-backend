import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/overview', profileController.getOverview);

export default router;
