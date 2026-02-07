'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpaceSwitcher() {
    const { spaces, currentSpace, switchSpace, createSpace, updateSpace, deleteSpace } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleUpdate = async (spaceId: string) => {
        if (!editName.trim()) return;
        await updateSpace(spaceId, editName);
        setEditingId(null);
    };

    const handleDelete = async (spaceId: string) => {
        await deleteSpace(spaceId);
    };

    const handleSwitch = async (spaceId: string) => {
        await switchSpace(spaceId);
        setIsOpen(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSpaceName.trim()) return;
        await createSpace(newSpaceName);
        setNewSpaceName('');
        setIsCreating(false);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-white"
            >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
                    {currentSpace?.name?.substring(0, 2).toUpperCase() || 'P'}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs text-slate-400 font-medium">Workspace</p>
                    <p className="text-sm font-bold truncate max-w-[120px]">
                        {currentSpace?.name || 'Personal'}
                    </p>
                </div>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 top-full mt-2 w-72 bg-[#1a2642] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-slate-700/50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Spaces</p>
                                <div className="space-y-1">
                                    {spaces.map((space) => {
                                        const isEditing = editingId === space._id;

                                        return (
                                            <div key={space._id} className="group flex items-center gap-2">
                                                {isEditing ? (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleUpdate(space._id);
                                                        }}
                                                        className="flex-1 flex items-center gap-2"
                                                    >
                                                        <input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="flex-1 bg-[#0f1729] border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <button type="submit" className="text-green-500 hover:text-green-400">✓</button>
                                                        <button type="button" onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400">✕</button>
                                                    </form>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSwitch(space._id)}
                                                        className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-colors ${currentSpace?._id === space._id
                                                            ? 'bg-blue-600 text-white'
                                                            : 'hover:bg-slate-700/50 text-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${currentSpace?._id === space._id ? 'bg-white/20' : 'bg-slate-700'
                                                            }`}>
                                                            {space.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 text-left truncate">{space.name}</div>
                                                        {currentSpace?._id === space._id && (
                                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                                        )}
                                                    </button>
                                                )}

                                                {!isEditing && (
                                                    <div className="hidden group-hover:flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingId(space._id);
                                                                setEditName(space.name);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                                                            title="Rename"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Delete this workspace?')) handleDelete(space._id);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-3 bg-[#0f1729]/50">
                                {isCreating ? (
                                    <form onSubmit={handleCreate} className="space-y-2">
                                        <input
                                            type="text"
                                            value={newSpaceName}
                                            onChange={(e) => setNewSpaceName(e.target.value)}
                                            placeholder="Space name (e.g., Office)"
                                            className="w-full px-3 py-2 bg-[#0f1729] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                                            >
                                                Create
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsCreating(false)}
                                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-700/30 transition-all group"
                                    >
                                        <span className="w-5 h-5 rounded flex items-center justify-center border border-slate-600 group-hover:border-slate-400">+</span>
                                        <span className="text-sm font-medium">Create New Space</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
