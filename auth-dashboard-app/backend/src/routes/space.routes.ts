import { Router } from 'express';
import {
    createSpace,
    getMySpaces,
    getSpace,
    switchSpace,
    inviteToSpace,
    updateSpace,
    deleteSpace,
} from '../controllers/space.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getMySpaces)
    .post(createSpace);

router.post('/switch', switchSpace);
router.post('/:id/invite', inviteToSpace);
router.route('/:id')
    .get(getSpace)
    .put(updateSpace)
    .delete(deleteSpace);

export default router;
