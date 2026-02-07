import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import { updateProfileValidation } from '../middleware/validation.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/me')
    .get(getProfile)
    .put(updateProfileValidation, updateProfile);

export default router;
