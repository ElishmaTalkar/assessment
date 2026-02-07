import { Router } from 'express';
import { getMyTeam, inviteMember } from '../controllers/team.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.get('/mine', getMyTeam);
router.post('/invite', inviteMember);

export default router;
