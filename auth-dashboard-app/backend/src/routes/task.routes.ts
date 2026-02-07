import { Router } from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats,
    prioritizeTasks,
} from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware';
import { taskValidation } from '../middleware/validation.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.post('/prioritize', prioritizeTasks);

router.get('/stats', getTaskStats);

router.route('/')
    .get(getTasks)
    .post(taskValidation, createTask);

router.route('/:id')
    .get(getTask)
    .put(taskValidation, updateTask)
    .delete(deleteTask);

export default router;
