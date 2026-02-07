import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    name: string;
    ownerId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    invitations: {
        email: string;
        token: string;
        status: 'pending' | 'accepted' | 'declined';
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const teamSchema = new Schema<ITeam>({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    invitations: [{
        email: { type: String, required: true },
        token: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
        createdAt: { type: Date, default: Date.now },
    }],
}, {
    timestamps: true,
});

export const Team = mongoose.model<ITeam>('Team', teamSchema);
