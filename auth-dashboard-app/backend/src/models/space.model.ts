import mongoose, { Document, Schema } from 'mongoose';

export interface IStatus {
    id: string;
    label: string;
    color: string;
}

export interface ISpace extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    statuses: IStatus[]; // Custom statuses
    createdAt: Date;
    updatedAt: Date;
}

const spaceSchema = new Schema<ISpace>(
    {
        name: {
            type: String,
            required: [true, 'Space name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        statuses: {
            type: [{
                id: { type: String, required: true },
                label: { type: String, required: true },
                color: { type: String, default: '#cbd5e1' } // Slate-300 default
            }],
            default: [
                { id: 'pending', label: 'To Do', color: '#fbbf24' },      // amber
                { id: 'in-progress', label: 'In Progress', color: '#3b82f6' }, // blue
                { id: 'completed', label: 'Completed', color: '#22c55e' }   // green
            ]
        }
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
spaceSchema.index({ owner: 1 });
spaceSchema.index({ members: 1 });

export const Space = mongoose.model<ISpace>('Space', spaceSchema);
