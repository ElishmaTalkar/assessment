import express from 'express';
import * as personalEntryController from '../controllers/personal-entry.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/', personalEntryController.createEntry);
router.get('/', personalEntryController.getEntries);
router.put('/:id', personalEntryController.updateEntry);
router.delete('/:id', personalEntryController.deleteEntry);

export default router;
