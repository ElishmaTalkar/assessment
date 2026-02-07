import React, { useState, useEffect } from 'react';
import { Task, IPersonalEntry } from '@/lib/types';
import { api } from '@/lib/api';
import { Clock, Plus, Save, Trash2, Eye, EyeOff, Mic, Search, ChevronRight, MessageSquare, ClipboardList, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PersonalHubProps {
    tasks: Task[];
}

type InterviewTab = 'star' | 'question' | 'reflection';

export default function PersonalHub({ tasks }: PersonalHubProps) {
    const [activeTab, setActiveTab] = useState<'brainDump' | 'interviewPrep'>('brainDump');
    const [interviewSubTab, setInterviewSubTab] = useState<InterviewTab>('star');

    // Brain Dump State
    const [quickNote, setQuickNote] = useState('');
    const [notes, setNotes] = useState<IPersonalEntry[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

    // Interview Prep State
    const [interviewEntries, setInterviewEntries] = useState<IPersonalEntry[]>([]);
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const [starData, setStarData] = useState({ situation: '', task: '', action: '', result: '', title: '' });
    const [questionData, setQuestionData] = useState({ question: '', answer: '' });
    const [reflectionContent, setReflectionContent] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial fetch of all notes/entries
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [notesRes, prepRes] = await Promise.all([
                api.get('/personal-entries', { params: { category: 'Note' } }),
                api.get('/personal-entries', { params: { category: 'Growth' } })
            ]);

            setNotes(notesRes.data.data.filter((e: IPersonalEntry) => e.subType === 'BrainDump'));
            setInterviewEntries(prepRes.data.data);

            // Set latest note as active if needed
            if (!currentNoteId && notesRes.data.data.length > 0) {
                const latest = notesRes.data.data[0];
                setQuickNote(latest.content || '');
                setCurrentNoteId(latest._id);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Brain Dump Logic ---
    const handleSelectNote = (note: IPersonalEntry) => {
        if (isSaving) return;
        setCurrentNoteId(note._id);
        setQuickNote(note.content || '');
    };

    const handleNewNote = () => {
        if (isSaving) return;
        setCurrentNoteId(null);
        setQuickNote('');
    };

    // Auto-save Brain Dump
    useEffect(() => {
        if (isLoading || activeTab !== 'brainDump') return;
        const timeout = setTimeout(async () => {
            if (quickNote !== undefined) {
                const currentNote = notes.find(n => n._id === currentNoteId);
                if (currentNoteId && currentNote && currentNote.content === quickNote) return;
                if (!currentNoteId && !quickNote.trim()) return;

                setIsSaving(true);
                try {
                    if (currentNoteId) {
                        await api.put(`/personal-entries/${currentNoteId}`, { content: quickNote });
                        setNotes(prev => prev.map(n => n._id === currentNoteId ? { ...n, content: quickNote, updatedAt: new Date().toISOString() } : n));
                    } else {
                        const res = await api.post('/personal-entries', { category: 'Note', subType: 'BrainDump', content: quickNote });
                        const newEntry = res.data.data;
                        setCurrentNoteId(newEntry._id);
                        setNotes(prev => [newEntry, ...prev]);
                    }
                } catch (err) { console.error(err); } finally { setTimeout(() => setIsSaving(false), 500); }
            }
        }, 1500);
        return () => clearTimeout(timeout);
    }, [quickNote, currentNoteId, isLoading, activeTab, notes]);

    // --- Interview Prep Logic ---
    const handleSelectInterviewEntry = (entry: IPersonalEntry) => {
        setCurrentEntryId(entry._id);
        const subType = entry.subType.toLowerCase();
        if (subType === 'star') setStarData(entry.data || { situation: '', task: '', action: '', result: '', title: '' });
        if (subType === 'question') setQuestionData(entry.data || { question: '', answer: '' });
        if (subType === 'reflection') setReflectionContent(entry.content || '');
        setInterviewSubTab(subType as InterviewTab);
    };

    const saveInterviewEntry = async (type: string, data: any, content: string = '') => {
        setIsSaving(true);
        try {
            if (currentEntryId) {
                await api.put(`/personal-entries/${currentEntryId}`, { data, content });
                setInterviewEntries(prev => prev.map(e => e._id === currentEntryId ? { ...e, data, content, updatedAt: new Date().toISOString() } : e));
            } else {
                const res = await api.post('/personal-entries', {
                    category: 'Growth',
                    subType: type.toLowerCase(),
                    data,
                    content
                });
                const newEntry = res.data.data;
                setCurrentEntryId(newEntry._id);
                setInterviewEntries(prev => [newEntry, ...prev]);
            }
            toast.success('Saved to Vault');
        } catch (err) {
            toast.error('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Header / Top Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Personal Hub
                    </h2>
                    <p className="text-slate-400 text-sm">Your Second Brain & Career War Room</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className={`p-2 rounded-lg transition-colors ${privacyMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="Toggle Privacy Blur"
                    >
                        {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search your brain..."
                            className="bg-slate-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full pb-6">
                {/* Left Column: Navigation & Quick Tasks */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="grid grid-cols-1 gap-3">
                        <NavCard
                            title="Brain Dump"
                            icon="🧠"
                            active={activeTab === 'brainDump'}
                            onClick={() => setActiveTab('brainDump')}
                            color="bg-indigo-500"
                        />
                        <NavCard
                            title="Interview Prep"
                            icon="🎯"
                            active={activeTab === 'interviewPrep'}
                            onClick={() => setActiveTab('interviewPrep')}
                            color="bg-rose-500"
                        />
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-200 mb-4">Task Quick View</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {tasks.slice(0, 3).map(task => (
                                <div key={task._id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs font-medium text-slate-300 line-clamp-1">{task.title}</p>
                                </div>
                            ))}
                            {tasks.length === 0 && <p className="text-center text-slate-600 text-xs py-4">No tasks</p>}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-0 relative overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                    {activeTab === 'brainDump' && (
                        <>
                            {/* Same Brain Dump UI as before */}
                            <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">History</h4>
                                    <button onClick={handleNewNote} className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"><Plus size={14} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {notes.map(note => (
                                        <button key={note._id} onClick={() => handleSelectNote(note)} className={`w-full text-left p-3 rounded-lg transition-all ${currentNoteId === note._id ? 'bg-slate-800 border-l-2 border-indigo-500' : 'hover:bg-slate-800/50 border-l-2 border-transparent'}`}>
                                            <p className={`text-sm font-medium line-clamp-1 ${currentNoteId === note._id ? 'text-white' : 'text-slate-400'}`}>{note.content?.split('\n')[0] || 'Empty Note'}</p>
                                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock size={10} /> {new Date(note.updatedAt).toLocaleDateString()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col p-6 h-full overflow-hidden">
                                <div className="flex justify-between items-center mb-4 shrink-0">
                                    <h3 className="text-xl font-semibold text-white">{currentNoteId ? 'Edit Note' : 'New Brain Dump'}</h3>
                                    {isSaving && <span className="text-xs text-slate-500 animate-pulse">Saving...</span>}
                                </div>
                                <textarea value={quickNote} onChange={(e) => setQuickNote(e.target.value)} placeholder="What's on your mind?..." className={`flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono text-sm leading-relaxed ${privacyMode ? 'blur-sm hover:blur-none' : ''}`} />
                            </div>
                        </>
                    )}

                    {activeTab === 'interviewPrep' && (
                        <>
                            {/* Interview Prep Sidebar */}
                            <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-slate-800">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Prep Vault</h4>
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => setInterviewSubTab('star')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${interviewSubTab === 'star' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                            <ClipboardList size={16} /> STAR Bank
                                        </button>
                                        <button onClick={() => setInterviewSubTab('question')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${interviewSubTab === 'question' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                            <MessageSquare size={16} /> Q&A Prep
                                        </button>
                                        <button onClick={() => setInterviewSubTab('reflection')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${interviewSubTab === 'reflection' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                            <History size={16} /> Reflections
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    <div className="px-2 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Recent Entries</div>
                                    {interviewEntries
                                        .filter(e => e.subType.toLowerCase() === interviewSubTab)
                                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                        .map(entry => (
                                            <button key={entry._id} onClick={() => handleSelectInterviewEntry(entry)} className={`w-full text-left p-3 rounded-lg transition-all ${currentEntryId === entry._id ? 'bg-slate-800 border-l-2 border-indigo-500' : 'hover:bg-slate-800/50 border-l-2 border-transparent'}`}>
                                                <p className="text-sm font-medium text-slate-300 line-clamp-1">
                                                    {entry.subType.toLowerCase() === 'reflection' ? entry.content?.split('\n')[0] : entry.data?.title || entry.data?.question || 'Untitled'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">{new Date(entry.updatedAt).toLocaleDateString()}</p>
                                            </button>
                                        ))}
                                    <button
                                        onClick={() => { setCurrentEntryId(null); setStarData({ situation: '', task: '', action: '', result: '', title: '' }); setQuestionData({ question: '', answer: '' }); setReflectionContent(''); }}
                                        className="w-full mt-2 p-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 text-xs flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> New {interviewSubTab === 'star' ? 'STAR Story' : interviewSubTab === 'question' ? 'Question' : 'Reflection'}
                                    </button>
                                </div>
                            </div>

                            {/* Interview Prep Editor */}
                            <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-white capitalize">
                                        {interviewSubTab === 'star' ? 'STAR Method Bank' : interviewSubTab === 'question' ? 'Interview Q&A' : 'Post-Interview Reflection'}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={async () => {
                                                if (currentEntryId && window.confirm('Delete this entry?')) {
                                                    try {
                                                        await api.delete(`/personal-entries/${currentEntryId}`);
                                                        setInterviewEntries(prev => prev.filter(e => e._id !== currentEntryId));
                                                        setCurrentEntryId(null);
                                                        setStarData({ situation: '', task: '', action: '', result: '', title: '' });
                                                        setQuestionData({ question: '', answer: '' });
                                                        setReflectionContent('');
                                                        toast.success('Entry deleted');
                                                    } catch (err) {
                                                        toast.error('Failed to delete');
                                                    }
                                                }
                                            }}
                                            className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => saveInterviewEntry(
                                                interviewSubTab === 'star' ? 'STAR' : interviewSubTab === 'question' ? 'Question' : 'Reflection',
                                                interviewSubTab === 'star' ? starData : interviewSubTab === 'question' ? questionData : {},
                                                reflectionContent
                                            )}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Entry'}
                                        </button>
                                    </div>
                                </div>

                                {interviewSubTab === 'star' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Story Title</label>
                                            <input type="text" value={starData.title} onChange={e => setStarData({ ...starData, title: e.target.value })} placeholder="e.g., Handling a Difficult Client" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-indigo-400">Situation</label>
                                                <textarea value={starData.situation} onChange={e => setStarData({ ...starData, situation: e.target.value })} placeholder="What was the context?" className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm resize-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-purple-400">Task</label>
                                                <textarea value={starData.task} onChange={e => setStarData({ ...starData, task: e.target.value })} placeholder="What was your goal?" className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm resize-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-emerald-400">Action</label>
                                                <textarea value={starData.action} onChange={e => setStarData({ ...starData, action: e.target.value })} placeholder="What did YOU specifically do?" className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm resize-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-orange-400">Result</label>
                                                <textarea value={starData.result} onChange={e => setStarData({ ...starData, result: e.target.value })} placeholder="What was the outcome? (Quantify!)" className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm resize-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {interviewSubTab === 'question' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Question</label>
                                            <input type="text" value={questionData.question} onChange={e => setQuestionData({ ...questionData, question: e.target.value })} placeholder="e.g., Why do you want to work here?" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-indigo-400 uppercase">Your Drafted Answer</label>
                                            <textarea value={questionData.answer} onChange={e => setQuestionData({ ...questionData, answer: e.target.value })} placeholder="Structure your response..." className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 text-sm leading-relaxed resize-none focus:ring-1 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                )}

                                {interviewSubTab === 'reflection' && (
                                    <div className="space-y-1 flex-1 flex flex-col">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Reflection Log</label>
                                        <textarea value={reflectionContent} onChange={e => setReflectionContent(e.target.value)} placeholder="How did it go? What was the hardest question? Who did you meet?..." className="flex-1 min-h-[400px] bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 text-sm leading-relaxed resize-none focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function NavCard({ title, icon, active, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${active
                ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
        >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 ${active ? 'opacity-100' : 'opacity-0'}`} />
            <span className="text-2xl mb-2 block">{icon}</span>
            <span className={`font-medium ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {title}
            </span>
            {active && <div className={`absolute bottom-0 left-0 w-full h-1 ${color}`} />}
        </button>
    );
}
