export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    createdAt: string;
    updatedAt?: string;
    currentSpace?: string | Space;
}

export interface IStatus {
    id: string;
    label: string;
    color: string;
}

export interface Space {
    _id: string;
    name: string;
    description?: string;
    owner: string | User;
    members: string[] | User[];
    statuses?: IStatus[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    status: string;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string; // Dynamic status
    priority: 'low' | 'medium' | 'high';
    category?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFields?: Record<string, any>;
    dueDate?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface TaskStats {
    total: number;
    pending: number;
    'in-progress': number;
    completed: number;
}

export interface ApiError {
    status: string;
    message: string;
    errors?: string[];
}

export interface IPersonalEntry {
    _id: string;
    userId: string;
    category: 'Note' | 'Learning' | 'Finance' | 'Lab' | 'Growth';
    subType: string;
    content?: string;
    data?: any;
    tags?: string[];
    isPinned?: boolean;
    createdAt: string;
    updatedAt: string;
}
