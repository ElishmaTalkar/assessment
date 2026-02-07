'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Target,
    Zap
} from 'lucide-react';

export interface EnhancementTip {
    category: 'critical' | 'important' | 'recommended' | 'optional';
    section: string;
    issue: string;
    tip: string;
    example?: string;
    impact: 'high' | 'medium' | 'low';
}

interface EnhancementTipsPanelProps {
    tips: EnhancementTip[];
    isLoading?: boolean;
}

export default function EnhancementTipsPanel({ tips, isLoading }: EnhancementTipsPanelProps) {
    const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set([0, 1, 2])); // Expand first 3 by default
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const toggleTip = (index: number) => {
        const newExpanded = new Set(expandedTips);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTips(newExpanded);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'critical':
                return <AlertCircle className="w-4 h-4" />;
            case 'important':
                return <AlertTriangle className="w-4 h-4" />;
            case 'recommended':
                return <Info className="w-4 h-4" />;
            case 'optional':
                return <Lightbulb className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'critical':
                return 'border-red-500 bg-red-500/10 text-red-400';
            case 'important':
                return 'border-orange-500 bg-orange-500/10 text-orange-400';
            case 'recommended':
                return 'border-blue-500 bg-blue-500/10 text-blue-400';
            case 'optional':
                return 'border-gray-500 bg-gray-500/10 text-gray-400';
            default:
                return 'border-gray-500 bg-gray-500/10 text-gray-400';
        }
    };

    const getImpactBadge = (impact: string) => {
        const colors = {
            high: 'bg-red-500/20 text-red-300 border-red-500/30',
            medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            low: 'bg-green-500/20 text-green-300 border-green-500/30'
        };
        return colors[impact as keyof typeof colors] || colors.low;
    };

    const filteredTips = selectedCategory === 'all'
        ? tips
        : tips.filter(tip => tip.category === selectedCategory);

    const categoryCounts = {
        critical: tips.filter(t => t.category === 'critical').length,
        important: tips.filter(t => t.category === 'important').length,
        recommended: tips.filter(t => t.category === 'recommended').length,
        optional: tips.filter(t => t.category === 'optional').length,
    };

    if (isLoading) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (tips.length === 0) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Perfect Resume!</h3>
                    <p className="text-slate-400">No enhancement suggestions at this time.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Enhancement Tips</h2>
                        <p className="text-sm text-slate-400">{tips.length} suggestions to improve your resume</p>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        All ({tips.length})
                    </button>
                    {categoryCounts.critical > 0 && (
                        <button
                            onClick={() => setSelectedCategory('critical')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${selectedCategory === 'critical'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <AlertCircle className="w-3 h-3" />
                            Critical ({categoryCounts.critical})
                        </button>
                    )}
                    {categoryCounts.important > 0 && (
                        <button
                            onClick={() => setSelectedCategory('important')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${selectedCategory === 'important'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Important ({categoryCounts.important})
                        </button>
                    )}
                    {categoryCounts.recommended > 0 && (
                        <button
                            onClick={() => setSelectedCategory('recommended')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${selectedCategory === 'recommended'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <Info className="w-3 h-3" />
                            Recommended ({categoryCounts.recommended})
                        </button>
                    )}
                </div>
            </div>

            {/* Tips List */}
            <div className="max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                    {filteredTips.map((tip, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-700 last:border-b-0"
                        >
                            <button
                                onClick={() => toggleTip(index)}
                                className="w-full p-4 hover:bg-slate-700/30 transition-colors text-left"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg border ${getCategoryColor(tip.category)} mt-0.5`}>
                                        {getCategoryIcon(tip.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {tip.section}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getImpactBadge(tip.impact)}`}>
                                                {tip.impact} impact
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-medium text-white mb-1">{tip.issue}</h3>
                                        {!expandedTips.has(index) && (
                                            <p className="text-xs text-slate-400 line-clamp-1">{tip.tip}</p>
                                        )}
                                    </div>
                                    <div className="text-slate-400 mt-1">
                                        {expandedTips.has(index) ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedTips.has(index) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 pl-16">
                                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                                <div className="flex items-start gap-2 mb-3">
                                                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-slate-200 leading-relaxed">{tip.tip}</p>
                                                </div>
                                                {tip.example && (
                                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                                        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                                                            Example:
                                                        </p>
                                                        <div className="bg-slate-800/50 rounded p-3 border border-slate-600">
                                                            <p className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                                                                {tip.example}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing {filteredTips.length} of {tips.length} tips</span>
                    <button
                        onClick={() => {
                            if (expandedTips.size === filteredTips.length) {
                                setExpandedTips(new Set());
                            } else {
                                setExpandedTips(new Set(filteredTips.map((_, i) => i)));
                            }
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        {expandedTips.size === filteredTips.length ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </div>
        </div>
    );
}
