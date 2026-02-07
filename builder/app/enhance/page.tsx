"use strict";
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/store/resume-store';
import ResumePreview from '@/components/ResumePreview';
import { FileText, Download, ArrowLeft, Check, Smartphone, Sparkles, Layout, MessageSquare, X, Send, SplitSquareHorizontal, Eye, Briefcase, Wand2 } from 'lucide-react';
import { TemplateType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancePage() {
    const router = useRouter();
    const {
        originalResume,
        enhancedResume,
        originalScore,
        enhancedScore,
        selectedTemplate,
        setSelectedTemplate,
        jobDescription,
        setJobDescription,
        setOriginalScore,
        setEnhancedResume,
        setSuggestions,
        isLoading,
        setLoading
    } = useResumeStore();

    const [isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'compare'>('preview');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Hi! I'm your AI Resume Coach. How can I help you improve your resume today?" }
    ]);
    const [localJD, setLocalJD] = useState('');
    const [isAnalyzingJD, setIsAnalyzingJD] = useState(false);

    // AI Rewriter State
    const [rewriteInput, setRewriteInput] = useState('');
    const [rewriteOutput, setRewriteOutput] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (!originalResume) {
            // router.push('/create'); 
        }
    }, [originalResume, router]);

    const handleSendMessage = () => {
        if (!chatMessage.trim()) return;

        // Add user message
        const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
        setChatHistory(newHistory);
        setChatMessage('');

        // Simulate AI response
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                role: 'ai',
                text: "That's a great question! Based on your resume, I'd suggest focusing on more quantifiable achievements in your Experience section to boost your impact, which will directly improve your ATS score."
            }]);
        }, 1000);
    };

    const handleAnalyzeJD = async () => {
        if (!localJD.trim() || !originalResume) return;

        setIsAnalyzingJD(true);
        setJobDescription(localJD);

        try {
            // Call API to recalculate score with JD
            const response = await fetch('/api/ats-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: originalResume, jobDescription: localJD }),
            });

            if (response.ok) {
                const { score } = await response.json();
                setOriginalScore(score);
            }
        } catch (error) {
            console.error('Error analyzing JD:', error);
        } finally {
            setIsAnalyzingJD(false);
        }
    };

    const handleRewrite = async () => {
        if (!rewriteInput.trim()) return;
        setIsRewriting(true);
        try {
            const response = await fetch('/api/enhance-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: rewriteInput,
                    type: 'resume bullet point',
                    jobDescription: jobDescription || ''
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setRewriteOutput(data.enhancedContent);
            }
        } catch (error) {
            console.error('Rewriting failed:', error);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleAutoEnhance = async () => {
        if (!originalResume) return;
        setIsEnhancing(true);
        setLoading(true);

        try {
            const response = await fetch('/api/enhance-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: originalResume,
                    jobDescription: jobDescription || ''
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setEnhancedResume(data.enhancedResume);
                setSuggestions(data.suggestions);

                // Automatically switch to compare mode to show improvements
                setViewMode('compare');

                // Add chat notification
                setChatHistory(prev => [...prev, {
                    role: 'ai',
                    text: `I've enhanced your resume! I improved ${data.suggestions.length} bullet points to be more impactful. Check the 'Compare' view to see the differences.`
                }]);
            }
        } catch (error) {
            console.error('Enhancement failed:', error);
        } finally {
            setIsEnhancing(false);
            setLoading(false);
        }
    };

    if (!isClient) return null;

    const templates: { id: TemplateType; name: string; description: string; color: string }[] = [
        {
            id: 'jake-resume',
            name: "Standard Template",
            description: "Minimalist, single-column, ATS-optimized standard.",
            color: "from-emerald-500 to-teal-600"
        },
        {
            id: 'professional-cv',
            name: "Professional",
            description: "Classic, elegant, perfect for corporate roles.",
            color: "from-blue-600 to-indigo-700"
        },
        {
            id: 'modern-resume',
            name: "Modern Creative",
            description: "Two-column, colorful, stands out visually.",
            color: "from-purple-500 to-pink-600"
        },
    ];

    const handleDownloadPDF = async () => {
        setLoading(true);
        if (typeof window === 'undefined') return;

        try {
            // Dynamically import html2pdf
            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;

            const element = document.getElementById('resume-preview'); // Target the resume preview
            const opt = {
                margin: 0,
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row font-sans">

            {/* --- Left Sidebar: Controls --- */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => router.push('/create')}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        title="Back to Edit"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Global Resume
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            AI Agent Active
                        </div>
                    </div>
                </div>

                {/* AI Magic Rewriter */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" /> Magic Rewriter
                    </h2>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 focus-within:border-purple-500 transition-colors">
                        <textarea
                            value={rewriteInput}
                            onChange={(e) => setRewriteInput(e.target.value)}
                            placeholder="Paste a rough bullet point or sentence here..."
                            className="w-full bg-transparent text-sm text-white resize-none h-20 focus:outline-none scrollbar-thin scrollbar-thumb-slate-600 mb-2"
                        />
                        {rewriteOutput && (
                            <div className="bg-slate-900/50 rounded p-2 mb-2 text-green-300 text-xs border border-green-500/30">
                                {rewriteOutput}
                            </div>
                        )}
                        <button
                            onClick={handleRewrite}
                            disabled={isRewriting || !rewriteInput.trim()}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                        >
                            {isRewriting ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            {rewriteOutput ? 'Rewrite Again' : 'Enhance Text'}
                        </button>
                    </div>
                </div>

                {/* Score Tracker Card */}
                <div className="mb-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase">
                            {jobDescription ? 'Job Match' : 'ATS Score'}
                        </span>
                        <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {enhancedScore ? `+${(enhancedScore.overall - (originalScore?.overall || 0))}%` : 'Active'}
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{enhancedScore?.overall || originalScore?.overall || 0}</span>
                        <span className="text-sm text-slate-500 mb-1">/ 100</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${enhancedScore?.overall || originalScore?.overall || 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${jobDescription ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-purple-500'}`}
                        />
                    </div>
                </div>

                {/* Job Description Input */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Target Job
                    </h2>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 focus-within:border-blue-500 transition-colors">
                        <textarea
                            value={localJD}
                            onChange={(e) => setLocalJD(e.target.value)}
                            placeholder="Paste Job Description here to check match..."
                            className="w-full bg-transparent text-sm text-white resize-none h-24 focus:outline-none scrollbar-thin scrollbar-thumb-slate-600"
                        />
                        <button
                            onClick={handleAnalyzeJD}
                            disabled={isAnalyzingJD || !localJD.trim()}
                            className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                        >
                            {isAnalyzingJD ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            Analyze Match
                        </button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex p-1 bg-slate-800 rounded-lg mb-8 border border-slate-700">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button
                        onClick={() => setViewMode('compare')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'compare' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <SplitSquareHorizontal className="w-4 h-4" /> Compare
                    </button>
                </div>

                {/* Template Selection */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Layout className="w-4 h-4" /> Select Template
                    </h2>
                    <div className="space-y-3">
                        {templates.map((t) => (
                            <motion.button
                                key={t.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${selectedTemplate === t.id
                                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${t.color} ${selectedTemplate === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold ${selectedTemplate === t.id ? 'text-white' : 'text-slate-200'}`}>
                                        {t.name}
                                    </h3>
                                    {selectedTemplate === t.id && <Check className="w-4 h-4 text-blue-400" />}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-3">
                    {/* Auto-Enhance Button */}
                    <button
                        onClick={handleAutoEnhance}
                        disabled={isEnhancing || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all text-white mb-2"
                    >
                        {isEnhancing ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Wand2 className="w-5 h-5" />
                        )}
                        Auto-Enhance Resume
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                        Download PDF
                    </button>

                    <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-slate-300">
                        <FileText className="w-5 h-5" />
                        Download Word (Coming Soon)
                    </button>
                </div>
            </div>

            {/* --- Right Main Area: Preview --- */}
            <div className="flex-1 bg-slate-950 p-4 md:p-8 lg:p-12 overflow-y-auto h-screen relative flex justify-center items-start">

                <div className="w-full max-w-[210mm] relative"> {/* A4 Width Approx */}
                    {/* Floating Info Pill (Hidden in Compare Mode) */}
                    {viewMode === 'preview' && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-slate-300 text-xs py-1.5 px-4 rounded-full border border-slate-700 flex items-center gap-2 whitespace-nowrap z-10">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            ATS Score: <span className="text-white font-bold">{originalScore?.overall || 'N/A'}</span>
                        </div>
                    )}

                    {/* Resume Paper Container - Handles Split View */}
                    <div className={`flex gap-8 transition-all duration-500 justify-center ${viewMode === 'compare' ? 'scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] -mt-10 origin-top' : 'scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 origin-top'}`}>

                        {/* Original Resume (Left side in Compare Mode) */}
                        {viewMode === 'compare' && (
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white shadow-2xl"
                                style={{ minHeight: '297mm', minWidth: '210mm' }}
                            >
                                <div className="bg-slate-100 text-slate-500 text-center py-2 text-sm font-bold uppercase tracking-widest border-b">
                                    Original
                                </div>
                                {originalResume && <ResumePreview data={originalResume} template="professional-cv" />}
                            </motion.div>
                        )}

                        {/* Enhanced/Selected Resume */}
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white shadow-2xl"
                            style={{ minHeight: '297mm', minWidth: '210mm' }}
                        >
                            {viewMode === 'compare' && (
                                <div className="bg-blue-50 text-blue-600 text-center py-2 text-sm font-bold uppercase tracking-widest border-b border-blue-100">
                                    Enhanced Preview
                                </div>
                            )}

                            {originalResume ? (
                                <ResumePreview data={enhancedResume || originalResume} template={selectedTemplate} />
                            ) : (
                                <div className="h-[297mm] flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                                    <FileText className="w-16 h-16 mb-4 text-slate-200" />
                                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Resume Data Found</h3>
                                    <p className="text-sm">Please go back to the Create page and fill in your details.</p>
                                    <button
                                        onClick={() => router.push('/create')}
                                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Go to Create
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Feedback Chat Widget */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                        style={{ maxHeight: '500px' }}
                    >
                        {/* Chat Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="font-bold">AI Resume Coach</span>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 rounded p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask for suggestions..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-50 group"
            >
                {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!isChatOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900" />
                )}
            </button>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #resume-preview, #resume-preview * {
                        visibility: visible;
                    }
                    #resume-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                    }
                    @page {
                        margin: 0;
                        size: auto;
                    }
                }
            `}</style>
        </div>
    );
}
