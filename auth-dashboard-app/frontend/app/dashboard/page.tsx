'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Task, TaskStats } from '@/lib/types';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Plus,
    X,
    LogOut,
    User,
    ListTodo,
    Menu,
    Kanban,
    Code,
    Eye,
    Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import SpaceSwitcher from '@/components/SpaceSwitcher';
import KanbanBoard from '@/components/KanbanBoard';
import PersonalHub from '@/components/PersonalHub';
import { IStatus } from '@/lib/types';
import { CATEGORY_DEFINITIONS, CATEGORY_OPTIONS } from '@/lib/constants/field-definitions';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user, logout, currentSpace } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const [team, setTeam] = useState<any>(null); // Add team state
    const [stats, setStats] = useState<TaskStats | null>({ total: 0, pending: 0, 'in-progress': 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterTab, setFilterTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    const defaultStatuses: IStatus[] = [
        { id: 'pending', label: 'To Do', color: '#fbbf24' },
        { id: 'in-progress', label: 'In Progress', color: '#3b82f6' },
        { id: 'completed', label: 'Completed', color: '#22c55e' }
    ];

    const currentStatuses = currentSpace?.statuses && currentSpace.statuses.length > 0
        ? currentSpace.statuses
        : defaultStatuses;

    useEffect(() => {
        fetchTasks();
        fetchStats();
        fetchTeam(); // Fetch team
    }, [currentSpace]); // Re-fetch when space changes

    const fetchTeam = async () => {
        try {
            const response = await api.get('/teams/mine');
            setTeam(response.data.data.team);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            console.error('Failed to fetch team');
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data.data.tasks);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/tasks/stats');
            setStats(response.data.data.stats);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted successfully');
            fetchTasks();
            fetchStats();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error('Failed to delete task');
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t._id === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchStats();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            toast.error('Failed to update status');
            fetchTasks(); // revert
        }
    };

    const handleLogout = () => {
        router.push('/');
        setTimeout(() => {
            logout();
        }, 50);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesTab =
            filterTab === 'all' ? true :
                filterTab === 'active' ? task.status !== 'completed' :
                    task.status === 'completed';

        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#0f1729]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
                
                body { 
                    font-family: 'Inter', sans-serif;
                    background: #0f1729;
                }
            `}</style>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-[#0f1729] z-[100] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading Dashboard...</p>
                </div>
            )}

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[280px] bg-[#1a2642] border-r border-slate-700/20 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6">
                    <div className="mb-8">
                        <SpaceSwitcher />
                    </div>

                    <div className="mb-10 flex items-center justify-between hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                                <LayoutDashboard className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">TaskFlow</h2>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => {
                                setFilterTab('all');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${filterTab !== 'mine' ? 'bg-blue-500/10 border-l-3 border-l-blue-500 text-white font-medium' : 'text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </button>
                        <button
                            onClick={() => {
                                setFilterTab('mine');
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${filterTab === 'mine' ? 'bg-blue-500/10 border-l-3 border-l-blue-500 text-white font-medium' : 'text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            <ListTodo className="w-5 h-5" />
                            <span>My Tasks</span>
                        </button>
                        <button onClick={() => { setShowProfileModal(true); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/30 rounded transition">
                            <User className="w-5 h-5" />
                            <span>Profile</span>
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-slate-700/30 rounded transition mt-8">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-h-screen">
                {/* Top Bar with Hamburger */}
                <div className="px-8 py-6">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-white hover:text-slate-300 transition"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            boxShadow: 'none',
                            outline: 'none'
                        }}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Page Content */}
                <div className="px-8 py-12 max-w-[1400px] mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-2 text-white tracking-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                                Dashboard
                            </h1>
                            <p className="text-slate-400 text-lg">Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</p>
                        </div>
                        <div className="flex gap-3">
                            {filterTab !== 'mine' && (
                                <button
                                    onClick={async () => {
                                        if (tasks.length === 0) {
                                            toast.error('There are no tasks available to prioritize!');
                                            return;
                                        }
                                        const toastId = toast.loading('AI is analyzing your tasks...');
                                        try {
                                            const res = await api.post('/tasks/prioritize');
                                            const suggestions = res.data.data.suggestions;

                                            if (suggestions.length > 0) {
                                                // Apply updates locally for instant feedback
                                                const newTasks = [...tasks];
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                suggestions.forEach((s: any) => {
                                                    const task = newTasks.find(t => t._id === s.id);
                                                    if (task) task.priority = s.newPriority;
                                                    api.put(`/tasks/${s.id}`, { priority: s.newPriority }); // Persist
                                                });
                                                setTasks(newTasks);
                                                toast.success(`Updated ${suggestions.length} tasks based on urgency! ⚡`, { id: toastId });
                                            } else {
                                                toast.success('Your tasks are already perfectly prioritized! 🤖', { id: toastId });
                                            }
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        } catch (_err) {
                                            toast.error('AI prioritization failed', { id: toastId });
                                        }
                                    }}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-purple-700 transition shadow-lg shadow-purple-900/20"
                                >
                                    <span className="text-lg">✨</span>
                                    AI Prioritize
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (!currentSpace) {
                                        toast.error('Please create or select a Space first!');
                                        return;
                                    }
                                    setShowCreateModal(true);
                                }}
                                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition shadow-lg ${currentSpace
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-75 shadow-none'}`}
                                title={!currentSpace ? "Create a Space to add tasks" : "New Task"}
                            >
                                <Plus className="w-5 h-5" />
                                New Task
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {
                        stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                                        <span className="text-xl">📋</span>
                                    </div>
                                    <div className="text-5xl font-bold mb-1 text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>{stats.total}</div>
                                    <div className="text-xs text-slate-500">All active tasks</div>
                                </div>

                                <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
                                        <span className="text-xl">📝</span>
                                    </div>
                                    <div className="text-5xl font-bold mb-1 text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>{stats.pending}</div>
                                    <div className="text-xs text-slate-500">Awaiting action</div>
                                </div>

                                <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
                                        <span className="text-xl">⚡</span>
                                    </div>
                                    <div className="text-5xl font-bold mb-1 text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>{stats['in-progress']}</div>
                                    <div className="text-xs text-slate-500">Currently working</div>
                                </div>

                                <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
                                        <span className="text-xl">✓</span>
                                    </div>
                                    <div className="text-5xl font-bold mb-1 text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>{stats.completed}</div>
                                    <div className="text-xs text-slate-500">Finished tasks</div>
                                </div>

                                {/* Global Search Card */}
                                <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition col-span-1 md:col-span-2 lg:col-span-2">
                                    <div className="flex flex-col h-full justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">🔍</span>
                                                <h3 className="font-bold text-white text-lg">Global Search</h3>
                                            </div>
                                            <p className="text-slate-400 text-sm">Find anything instantly</p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search tasks..."
                                                className="w-full bg-[#0f1729] border border-slate-700 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Team Collaboration Card */}
                                {filterTab !== 'mine' && (
                                    <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-5 hover:border-slate-600/40 transition col-span-1 md:col-span-2 lg:col-span-2">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xl">👥</span>
                                                    <h3 className="font-bold text-white text-lg">Team Members</h3>
                                                </div>
                                                <p className="text-slate-400 text-sm">Members of {currentSpace?.name || 'this space'}</p>
                                            </div>

                                            <div className="flex -space-x-4 overflow-hidden py-2 items-center">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {currentSpace?.members && Array.isArray(currentSpace.members) && currentSpace.members.map((member: any, i: number) => (
                                                    <div key={member._id || i} className="inline-block h-12 w-12 rounded-full ring-2 ring-[#1a2642] bg-blue-600 text-white flex items-center justify-center font-bold text-md shadow-lg transform hover:-translate-y-1 transition duration-300 relative group cursor-help">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                                                        ) : (
                                                            member.name?.charAt(0).toUpperCase() || 'U'
                                                        )}
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                                            {member.name}
                                                        </span>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        if (!currentSpace) {
                                                            toast.error('Please create or select a space first');
                                                            return;
                                                        }
                                                        setShowInviteModal(true);
                                                    }}
                                                    className={`h-12 w-12 rounded-full bg-slate-700/50 border border-dashed border-slate-500 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white hover:border-slate-400 transition ${currentSpace?.members && currentSpace.members.length > 0 ? 'ml-4' : ''}`}
                                                    title="Invite new member"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )
                    }

                    {/* Task Content */}
                    {filterTab === 'mine' ? (
                        <div className="h-[calc(100vh-200px)]">
                            <PersonalHub tasks={tasks?.filter(t => user && t.userId === user.id) || []} />
                        </div>
                    ) : (
                        <div className="bg-[#1a2642] border border-slate-700/20 rounded-xl overflow-hidden shadow-xl animate-scale-in relative z-10">
                            {/* ... Existing Kanban/List View ... */}
                            {/* View Controls */}
                            <div className="p-4 border-b border-slate-700/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex bg-slate-900/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            title="List View"
                                        >
                                            <ListTodo size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('board')}
                                            className={`p-2 rounded ${viewMode === 'board' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            title="Board View"
                                        >
                                            <Kanban size={18} />
                                        </button>
                                    </div>
                                    <div className="hidden md:flex items-center text-sm text-slate-400 border-l border-slate-700/30 pl-4">
                                        <span className="font-medium text-slate-300 mr-2">{tasks.length}</span> Tasks
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-slate-900/50 border border-slate-700/30 text-slate-200 text-sm rounded-lg px-4 py-2 pl-4 focus:outline-none focus:border-blue-500 w-48 transition-all focus:w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'board' ? (
                                <div className="p-6 overflow-x-auto">
                                    <KanbanBoard
                                        tasks={filteredTasks}
                                        onTaskClick={(task) => {
                                            setEditingTask(task);
                                            setShowCreateModal(true);
                                        }}
                                        onUpdateTaskStatus={handleUpdateTaskStatus}
                                        statuses={currentStatuses}
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900/50 text-slate-400 text-sm">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-medium">Task</th>
                                                <th className="px-6 py-4 text-left font-medium">Status</th>
                                                <th className="px-6 py-4 text-left font-medium">Priority</th>
                                                <th className="px-6 py-4 text-left font-medium">Category</th>
                                                <th className="px-6 py-4 text-left font-medium">Due Date</th>
                                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/30">
                                            {filteredTasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                                <ListTodo className="w-8 h-8 text-slate-600" />
                                                            </div>
                                                            <p className="text-lg font-medium text-slate-400">No tasks found</p>
                                                            <p className="text-sm mt-1">Create a new task to get started</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredTasks.map((task) => (
                                                    <tr key={task._id} className="hover:bg-slate-800/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleUpdateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-600 hover:border-blue-500'
                                                                        }`}
                                                                >
                                                                    {task.status === 'completed' && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -mt-0.5 rotate-[-45deg]" />}
                                                                </button>
                                                                <div>
                                                                    <p className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
                                                                        }`}>
                                                                        {task.title}
                                                                    </p>
                                                                    {task.tags && task.tags.length > 0 && (
                                                                        <div className="flex gap-1 mt-1">
                                                                            {task.tags.map(tag => (
                                                                                <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                                                                                    #{tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${task.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                }`}>
                                                                {currentStatuses.find(s => s.id === task.status)?.label || task.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-400' :
                                                                    task.priority === 'medium' ? 'bg-yellow-400' :
                                                                        'bg-green-400'
                                                                    }`} />
                                                                <span className="text-sm font-medium capitalize">{task.priority}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {task.category ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-6 h-6 rounded flex items-center justify-center ${CATEGORY_DEFINITIONS[task.category]?.color || 'bg-slate-700'
                                                                        } text-white`}>
                                                                        {(() => {
                                                                            const Icon = CATEGORY_DEFINITIONS[task.category]?.icon || Code;
                                                                            return <Icon size={14} />;
                                                                        })()}
                                                                    </span>
                                                                    <span className="text-slate-300 text-sm">{CATEGORY_DEFINITIONS[task.category]?.label || task.category}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-500 text-sm">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {task.dueDate ? (
                                                                <span className="text-slate-300 text-sm">
                                                                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-500 text-sm">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setViewingTask(task)} // Open Read-Only Modal
                                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingTask(task);
                                                                        setShowCreateModal(true);
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition"
                                                                >
                                                                    <div className="w-4 h-4 border-2 border-current rounded-sm" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTask(task._id)}
                                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div >
            </main >

            {/* Modals */}
            {
                showCreateModal && (
                    <TaskModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchTasks();
                            fetchStats();
                        }}
                    />
                )
            }

            {
                editingTask && (
                    <TaskModal
                        task={editingTask}
                        onClose={() => setEditingTask(null)}
                        onSuccess={() => {
                            setEditingTask(null);
                            fetchTasks();
                            fetchStats();
                        }}
                    />
                )
            }

            {
                showProfileModal && (
                    <ProfileModal
                        onClose={() => setShowProfileModal(false)}
                        onSuccess={() => setShowProfileModal(false)}
                    />
                )
            }

            {
                viewingTask && (
                    <TaskDetailsModal
                        task={viewingTask}
                        onClose={() => setViewingTask(null)}
                        onEdit={() => {
                            setViewingTask(null);
                            setEditingTask(viewingTask);
                        }}
                    />
                )
            }

            {
                showInviteModal && (
                    <InviteMemberModal
                        onClose={() => setShowInviteModal(false)}
                        onSuccess={() => setShowInviteModal(false)}
                    />
                )
            }
        </div >
    );
}

// Task Row Component
function TaskRow({ task, index, onEdit, onDelete, onView }: { task: Task; index: number; onEdit: () => void; onDelete: () => void; onView: (task: Task) => void }) {
    const getStatusBadge = (status: string) => {
        const styles = {
            'in-progress': { bg: 'bg-blue-600', text: 'text-white', label: 'In Progress' },
            'pending': { bg: 'bg-amber-600', text: 'text-white', label: 'Pending' },
            'completed': { bg: 'bg-green-600', text: 'text-white', label: 'Completed' },
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            'high': 'text-red-500',
            'medium': 'text-amber-500',
            'low': 'text-green-500',
        };
        return colors[priority as keyof typeof colors] || colors.medium;
    };

    const statusInfo = getStatusBadge(task.status);

    return (
        <tr className="border-b border-slate-700/10 hover:bg-slate-700/10 transition group">
            <td className="py-5 px-4 text-slate-400 text-sm">{index}</td>
            <td className="py-5 px-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {CATEGORY_DEFINITIONS[task.category || 'Planning'] && (
                            (() => {
                                const CatIcon = CATEGORY_DEFINITIONS[task.category || 'Planning'].icon;
                                return <CatIcon className={`w-4 h-4 ${CATEGORY_DEFINITIONS[task.category || 'Planning'].color.replace('bg-', 'text-')}`} />;
                            })()
                        )}
                        <span
                            className="text-white font-medium text-sm cursor-pointer hover:text-blue-400 transition"
                            onClick={() => onView(task)}
                        >
                            {task.title}
                        </span>
                    </div>
                    {task.description && <span className="text-slate-400 text-sm mt-1 block">{task.description}</span>}

                    {/* Key Custom Fields Summary */}
                    {task.customFields && Object.keys(task.customFields).length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {task.customFields.budgetCeiling && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    💰 {task.customFields.currency || '$'}{task.customFields.budgetCeiling}
                                </span>
                            )}
                            {task.customFields.roiImpact && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    📈 ROI: {task.customFields.roiImpact}
                                </span>
                            )}
                            {task.customFields.complexity && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    Fib: {task.customFields.complexity}
                                </span>
                            )}
                            {task.customFields.commitLink && (
                                <a href={task.customFields.commitLink} target="_blank" rel="noopener noreferrer" className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <Code className="w-3 h-3" /> Commit
                                </a>
                            )}
                            {task.customFields.severity && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    🐞 {task.customFields.severity}
                                </span>
                            )}
                            {task.customFields.docType && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    📄 {task.customFields.docType}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </td>
            <td className="py-5 px-4">
                <span className={`inline-block px-3 py-1 rounded ${statusInfo.bg} ${statusInfo.text} text-xs font-medium`}>
                    {statusInfo.label}
                </span>
            </td>
            <td className="py-5 px-4">
                <span className={`font-semibold capitalize text-sm ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
            </td>
            <td className="py-5 px-4 text-slate-400 text-sm">
                {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
            </td>
            <td className="py-5 px-4">
                {task.tags && task.tags.length > 0 ? (
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                        {task.tags[0]}
                    </span>
                ) : (
                    <span className="text-slate-600">-</span>
                )}
            </td>
            <td className="py-5 px-4">
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="text-slate-400 hover:text-white text-sm transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-slate-400 hover:text-red-400 text-sm transition"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Task Modal Component
function TaskModal({ task, onClose, onSuccess }: { task?: Task; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        status: string;
        priority: 'low' | 'medium' | 'high';
        category: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customFields: Record<string, any>;
        dueDate: string;
        tags: string;
    }>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        category: task?.category || 'Planning',
        customFields: task?.customFields || {},
        dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        tags: task?.tags?.join(', ') || '',
    });
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [errors, setErrors] = useState<any>({});


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setErrors({ title: 'Title is required' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                dueDate: formData.dueDate || undefined,
            };

            if (task) {
                await api.put(`/tasks/${task._id}`, payload);
                toast.success('Task updated successfully');
            } else {
                await api.post('/tasks', payload);
                toast.success('Task created successfully');
            }
            onSuccess();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2642] border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{task ? 'Edit Task' : 'Create New Task'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                setErrors({ ...errors, title: undefined });
                            }}
                            className={`w-full px-4 py-3 bg-[#0f1729] border ${errors.title ? 'border-red-500/50' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all`}
                            placeholder="e.g., Redesign homepage"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all min-h-[100px]"
                            placeholder="Add details about this task..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                {/* Future: Render dynamically from space.statuses */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        >
                            {CATEGORY_OPTIONS.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Custom Fields */}
                    {CATEGORY_DEFINITIONS[formData.category] && (
                        <div className={`bg-[#1a2642] p-4 rounded-xl border border-${CATEGORY_DEFINITIONS[formData.category].color.replace('bg-', '')}/30 space-y-3 animate-in fade-in slide-in-from-top-2`}>
                            <h4 className={`text-sm font-bold ${CATEGORY_DEFINITIONS[formData.category].color.replace('bg-', 'text-')} flex items-center gap-2`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DEFINITIONS[formData.category].color}`}></span>
                                {CATEGORY_DEFINITIONS[formData.category].label} Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CATEGORY_DEFINITIONS[formData.category].fields.map(field => (
                                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">{field.label}</label>

                                        {field.type === 'select' ? (
                                            <select
                                                value={formData.customFields[field.name] || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    customFields: { ...formData.customFields, [field.name]: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 bg-[#0f1729] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select...</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'toggle' ? (
                                            <div className="flex items-center gap-3 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        customFields: { ...formData.customFields, [field.name]: !formData.customFields[field.name] }
                                                    })}
                                                    className={`w-10 h-6 rounded-full transition-colors relative ${formData.customFields[field.name] ? 'bg-blue-600' : 'bg-slate-700'}`}
                                                >
                                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.customFields[field.name] ? 'translate-x-4' : ''}`} />
                                                </button>
                                                <span className="text-sm text-slate-300">{formData.customFields[field.name] ? 'Yes' : 'No'}</span>
                                            </div>
                                        ) : field.type === 'textarea' ? (
                                            <textarea
                                                value={formData.customFields[field.name] || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    customFields: { ...formData.customFields, [field.name]: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 bg-[#0f1729] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                                                placeholder={field.placeholder}
                                            />
                                        ) : (
                                            <input
                                                type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                                                value={formData.customFields[field.name] || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    customFields: { ...formData.customFields, [field.name]: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 bg-[#0f1729] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                                                placeholder={field.placeholder}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">Tags</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="work, urgent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Profile Modal Component
function ProfileModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        location: user?.location || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put('/profile/me', formData);
            updateUser(response.data.data.user);
            toast.success('Profile updated successfully');
            onSuccess();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2642] border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all min-h-[80px]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-1">Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Task Details Modal Component
function TaskDetailsModal({ task, onClose, onEdit }: { task: Task; onClose: () => void; onEdit: () => void }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryDef = CATEGORY_DEFINITIONS[task.category as any];
    const CatIcon = categoryDef?.icon || Code;
    const catColor = categoryDef?.color || 'bg-blue-600';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2642] border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 mb-6 pr-8">
                    <div className={`p-3 rounded-xl ${catColor.replace('bg-', 'bg-').replace('600', '500/20')} ${catColor.replace('bg-', 'text-')}`}>
                        <CatIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
                        <div className="flex gap-2 items-center flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${catColor.replace('bg-', 'border-').replace('600', '500/30')} ${catColor.replace('bg-', 'text-')}`}>
                                {task.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700`}>
                                Status: {task.status.replace('-', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed bg-[#0f1729] p-4 rounded-xl border border-slate-700/50">
                            {task.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Custom Fields */}
                    {categoryDef && task.customFields && Object.keys(task.customFields).length > 0 && (
                        <div className={`bg-[#0f1729] rounded-xl border ${catColor.replace('bg-', 'border-').replace('600', '500/20')} p-5`}>
                            <h3 className={`text-sm font-bold ${catColor.replace('bg-', 'text-')} mb-4 flex items-center gap-2`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {categoryDef.label} Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {categoryDef.fields.map((field: any) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const value = (task.customFields as any)?.[field.name];
                                    if (value === undefined || value === '' || value === null) return null;

                                    return (
                                        <div key={field.name} className={`flex flex-col ${field.type === 'textarea' || field.type === 'text' ? 'col-span-1 md:col-span-2' : ''}`}>
                                            <span className="text-xs font-semibold text-slate-500 mb-1">{field.label}</span>
                                            <div className="text-slate-200 text-sm font-medium break-words">
                                                {field.type === 'toggle' ? (
                                                    value ? 'Yes' : 'No'
                                                ) : (field.label.toLowerCase().includes('link') || field.label.toLowerCase().includes('url') || (typeof value === 'string' && value.startsWith('http'))) ? (
                                                    <a
                                                        href={value as string}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                                    >
                                                        {value}
                                                        <span className="text-[10px]">↗</span>
                                                    </a>
                                                ) : (
                                                    <span>{String(value)}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-4 border-t border-slate-700/30">
                        <div>
                            <span className="block font-semibold text-slate-400 mb-0.5">Due Date</span>
                            {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
                        </div>
                        <div>
                            <span className="block font-semibold text-slate-400 mb-0.5">Tags</span>
                            {task.tags && task.tags.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                    {task.tags.map(tag => (
                                        <span key={tag} className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">#{tag}</span>
                                    ))}
                                </div>
                            ) : 'No tags'}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={onEdit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Invite Member Modal Component
function InviteMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { currentSpace } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !currentSpace) return;

        setLoading(true);
        try {
            const res = await api.post(`/spaces/${currentSpace._id}/invite`, { email });
            navigator.clipboard.writeText(res.data.data.inviteLink);
            toast.success('Invite link copied to clipboard! 🔗');
            onSuccess();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send invite');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a2642] border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Invite Member</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-slate-300 text-sm mb-4">
                        Invite a new member to <span className="font-bold text-white">{currentSpace?.name}</span>. Currently, this will generate an invite link for you to share.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">Email Address (Gmail, etc.)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600"
                                placeholder="colleague@gmail.com"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Generating...' : 'Generate Link 🔗'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
