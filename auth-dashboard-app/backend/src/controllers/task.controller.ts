import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Task } from '../models/task.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    AI Prioritize Tasks
// @route   POST /api/v1/tasks/prioritize
// @access  Private
export const prioritizeTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        // Filter by current space
        const query: any = req.user.currentSpace
            ? { userId: req.user._id, spaceId: req.user.currentSpace }
            : { userId: req.user._id, spaceId: { $exists: false } };

        // Also exclude completed tasks
        query.status = { $ne: 'completed' };

        const tasks = await Task.find(query);

        // MOCK AI ALGORITHM
        // In a real app, this would call OpenAI/Gemini
        const prioritizedTasks = tasks.map(task => {
            let score = 0;
            const title = task.title.toLowerCase();
            const desc = task.description?.toLowerCase() || '';

            console.log(`[AI] Checking task: "${task.title}"`);

            // 1. Keyword Analysis
            if (title.includes('urgent') || title.includes('asap') || title.includes('critical')) {
                score += 50;
                console.log('  -> Urgent Keyword found');
            }
            if (title.includes('review') || title.includes('deadline')) score += 20;

            // 2. Due Date Analysis
            if (task.dueDate) {
                const now = new Date();
                const due = new Date(task.dueDate);
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays < 0) score += 40; // Overdue
                else if (diffDays <= 2) score += 30; // Due soon
                else if (diffDays <= 7) score += 10;
            }

            // 3. Status Analysis
            if (task.status === 'in-progress') score += 15;

            // Determine new smart priority
            let newPriority = 'low';
            if (score >= 40) newPriority = 'high';
            else if (score >= 15) newPriority = 'medium';

            return {
                id: task._id,
                title: task.title,
                oldPriority: task.priority,
                newPriority,
                reason: score >= 40 ? 'High urgency detected' : (score >= 15 ? 'Moderate priority' : 'Routine task')
            };
        });

        // Filter only those that need changing
        const suggestions = prioritizedTasks.filter(t => t.oldPriority !== t.newPriority);

        res.status(200).json({
            status: 'success',
            data: {
                suggestions,
                message: suggestions.length > 0
                    ? `AI found ${suggestions.length} tasks to re-prioritize`
                    : 'Your task list is already perfectly prioritized! 🤖'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error prioritizing tasks',
        });
    }
};

// @desc    Get all tasks for logged-in user
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        // Extract query parameters for filtering and searching
        const { status, priority, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

        // Build query
        // If user has a currentSpace, filter by it. Otherwise, fallback to userId (personal tasks)
        const query: any = req.user.currentSpace
            ? { spaceId: req.user.currentSpace }
            : { userId: req.user._id, spaceId: { $exists: false } };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Build sort object
        const sortOrder = order === 'asc' ? 1 : -1;
        const sort: any = { [sortBy as string]: sortOrder };

        // Pagination
        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = parseInt(limit as string, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Get total count for metadata
        const total = await Task.countDocuments(query);

        const tasks = await Task.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            status: 'success',
            results: tasks.length,
            data: {
                tasks,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching tasks',
        });
    }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!task) {
            res.status(404).json({
                status: 'error',
                message: 'Task not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                task,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching task',
        });
    }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array().map(err => err.msg),
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        console.log('[CreateTask] Body:', req.body);
        console.log('[CreateTask] User Space:', req.user.currentSpace);

        const task = await Task.create({
            ...req.body,
            userId: req.user._id,
            spaceId: req.user.currentSpace,
        });

        res.status(201).json({
            status: 'success',
            message: 'Task created successfully',
            data: {
                task,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error creating task',
        });
    }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array().map(err => err.msg),
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id,
            },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!task) {
            res.status(404).json({
                status: 'error',
                message: 'Task not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Task updated successfully',
            data: {
                task,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error updating task',
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!task) {
            res.status(404).json({
                status: 'error',
                message: 'Task not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully',
            data: null,
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error deleting task',
        });
    }
};

// @desc    Get task statistics
// @route   GET /api/v1/tasks/stats
// @access  Private
export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        // Match tasks for the current space (or personal if no space)
        const matchStage: any = req.user.currentSpace
            ? { userId: req.user._id, spaceId: req.user.currentSpace }
            : { userId: req.user._id, spaceId: { $exists: false } };

        const stats = await Task.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats = {
            total: 0,
            pending: 0,
            'in-progress': 0,
            completed: 0,
        };

        stats.forEach((stat) => {
            formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats: formattedStats,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching task statistics',
        });
    }
};
