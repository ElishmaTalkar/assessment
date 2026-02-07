'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Space } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    spaces: Space[];
    currentSpace: Space | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    createSpace: (name: string, description?: string) => Promise<void>;
    switchSpace: (spaceId: string) => Promise<void>;
    updateSpace: (spaceId: string, name: string) => Promise<void>;
    deleteSpace: (spaceId: string) => Promise<void>;
    fetchSpaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSpaces = async () => {
        try {
            const res = await api.get('/spaces');
            setSpaces(res.data.data.spaces);
        } catch (error) {
            console.error('Failed to fetch spaces', error);
        }
    };

    const fetchCurrentSpace = async (spaceId: string) => {
        try {
            const res = await api.get(`/spaces/${spaceId}`);
            setCurrentSpace(res.data.data.space);
        } catch (error) {
            console.error('Failed to fetch current space', error);
            // Fallback: if current space not found (deleted?), maybe switch to first available?
            setCurrentSpace(null);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);

                    // Fetch fresh spaces
                    if (token) {
                        try {
                            const spacesRes = await api.get('/spaces');
                            setSpaces(spacesRes.data.data.spaces);

                            if (parsedUser.currentSpace) {
                                // If user has a current space, fetch its details
                                // Note: user.currentSpace might be ID or object depending on backend population
                                const spaceId = typeof parsedUser.currentSpace === 'string'
                                    ? parsedUser.currentSpace
                                    : (parsedUser.currentSpace as Space)._id;

                                const spaceRes = await api.get(`/spaces/${spaceId}`);
                                setCurrentSpace(spaceRes.data.data.space);
                            }
                        } catch (e) {
                            console.error('Error fetching initial space data', e);
                        }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log('Login Response:', response.data); // DEBUG
            console.log('Data structure:', response.data.data); // DEBUG

            const { user: userData, accessToken, refreshToken } = response.data.data;
            console.log('Tokens:', { accessToken, refreshToken }); // DEBUG

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Fetch spaces after login - specific error handling so login doesn't fail if spaces fail
            try {
                const spacesRes = await api.get('/spaces');
                setSpaces(spacesRes.data.data.spaces);

                if (userData.currentSpace) {
                    const spaceId = typeof userData.currentSpace === 'string'
                        ? userData.currentSpace
                        : (userData.currentSpace as Space)._id;
                    const spaceRes = await api.get(`/spaces/${spaceId}`);
                    setCurrentSpace(spaceRes.data.data.space);
                }
            } catch (spaceError) {
                console.error('Failed to fetch spaces during login', spaceError);
                // Don't throw here, let the user login proceed
            }

            toast.success('Login successful!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const signup = async (name: string, email: string, password: string, phone?: string) => {
        try {
            const response = await api.post('/auth/signup', { name, email, password, phone });
            const { user: userData, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            toast.success('Account created successfully!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const message = error.response?.data?.message || 'Signup failed';
            const errors = error.response?.data?.errors;
            if (errors && errors.length > 0) {
                toast.error(errors[0]);
            } else {
                toast.error(message);
            }
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setSpaces([]);
        setCurrentSpace(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const createSpace = async (name: string, description?: string) => {
        try {
            console.log('Frontend creating space:', name); // DEBUG
            const res = await api.post('/spaces', { name, description });
            const newSpace = res.data.data.space;
            console.log('Space created successfully:', newSpace); // DEBUG
            setSpaces([...spaces, newSpace]);
            setCurrentSpace(newSpace);

            // Update user's current space locally
            updateUser({ currentSpace: newSpace._id });
            toast.success('Space created!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Frontend create space error:', error.response?.data || error.message); // DEBUG
            toast.error(error.response?.data?.message || 'Failed to create space');
            throw error;
        }
    };

    const switchSpace = async (spaceId: string) => {
        try {
            const res = await api.post('/spaces/switch', { spaceId });
            const updatedUser = res.data.data.user;

            updateUser(updatedUser);

            // Update current space object
            const space = spaces.find(s => s._id === spaceId);
            if (space) {
                setCurrentSpace(space);
            } else {
                // If not in list (shouldn't happen), fetch it
                await fetchCurrentSpace(spaceId);
            }

            toast.success('Switched space');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to switch space');
            throw error;
        }
    };

    const updateSpace = async (spaceId: string, name: string) => {
        try {
            const res = await api.put(`/spaces/${spaceId}`, { name });
            const updatedSpace = res.data.data.space;

            setSpaces(spaces.map(s => s._id === spaceId ? updatedSpace : s));
            if (currentSpace?._id === spaceId) {
                setCurrentSpace(updatedSpace);
            }
            toast.success('Space updated');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update space');
            throw error;
        }
    };

    const deleteSpace = async (spaceId: string) => {
        try {
            console.log('Frontend deleting space:', spaceId); // DEBUG
            await api.delete(`/spaces/${spaceId}`);

            const newSpaces = spaces.filter(s => s._id !== spaceId);
            setSpaces(newSpaces);

            // If deleted current space, switch to personal (null)
            if (currentSpace?._id === spaceId) {
                setCurrentSpace(null);
                updateUser({ currentSpace: undefined });
            }

            toast.success('Space deleted');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Delete space error:', error.response?.data || error.message); // DEBUG
            toast.error(error.response?.data?.message || 'Failed to delete space');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, spaces, currentSpace, login, signup, logout, updateUser, createSpace, switchSpace, updateSpace, deleteSpace, fetchSpaces }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
