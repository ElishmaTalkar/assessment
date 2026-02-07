import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category?: 'Design' | 'Development' | 'Testing' | 'Planning' | 'Marketing';
    dueDate?: Date;
    userId: mongoose.Types.ObjectId;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    customFields?: any; // Flexible storage
    spaceId?: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        status: {
            type: String,
            default: 'pending',
            // Enum removed to support custom statuses per workspace
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        category: {
            type: String,
            default: 'Planning',
            // Enum removed to support arbitrary categories if needed, though we validate on frontend
        },
        customFields: {
            type: Schema.Types.Mixed, // Flexible storage for all category-specific data
            default: {},
        },
        spaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Space',
        },
        dueDate: {
            type: Date,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
