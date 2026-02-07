import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalEntry extends Document {
    userId: mongoose.Types.ObjectId;
    category: 'Note' | 'Learning' | 'Finance' | 'Lab' | 'Growth';
    subType: string; // e.g. 'BrainDump', 'TIL', 'Subscription'
    content?: string;
    data?: any; // Structured data
    tags?: string[];
    isPinned?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const personalEntrySchema = new Schema<IPersonalEntry>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Note', 'Learning', 'Finance', 'Lab', 'Growth'],
        },
        subType: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        data: {
            type: Schema.Types.Mixed,
            default: {},
        },
        tags: [{
            type: String,
            trim: true,
        }],
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by user and category
personalEntrySchema.index({ userId: 1, category: 1, createdAt: -1 });

export const PersonalEntry = mongoose.model<IPersonalEntry>('PersonalEntry', personalEntrySchema);
