'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Bookmark,
    Shield,
    Target,
    Award,
    Zap
} from 'lucide-react';

interface ATSIssue {
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    description: string;
    suggestion: string;
    example?: string;
    isPremium?: boolean;
}

interface ATSCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    score: number;
    issues: ATSIssue[];
    color: string;
}

interface ProfessionalATSAnalysisProps {
    resumeData: any;
    atsScore: any;
}

export default function ProfessionalATSAnalysis({ resumeData, atsScore }: ProfessionalATSAnalysisProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['content']));
    const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleIssue = (issueId: string) => {
        const newExpanded = new Set(expandedIssues);
        if (newExpanded.has(issueId)) {
            newExpanded.delete(issueId);
        } else {
            newExpanded.add(issueId);
        }
        setExpandedIssues(newExpanded);
    };

    // Analyze resume and generate categories
    const categories = analyzeResume(resumeData, atsScore);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 bg-green-500/10';
        if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">ATS Analysis</h2>
                        <p className="text-sm text-gray-600">Detailed breakdown of your resume</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded ${category.color}`}>
                                        {category.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{category.title}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(category.score)}`}>
                                                {category.score}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {category.issues.length} {category.issues.length === 1 ? 'issue' : 'issues'}
                                        </p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedCategories.has(category.id) ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </motion.div>
                            </div>
                        </button>

                        {/* Category Issues */}
                        <AnimatePresence>
                            {expandedCategories.has(category.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-2">
                                        {category.issues.map((issue) => (
                                            <div key={issue.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Issue Header */}
                                                <button
                                                    onClick={() => toggleIssue(issue.id)}
                                                    className="w-full p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {getSeverityIcon(issue.severity)}
                                                            <div className="text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {issue.title}
                                                                    </span>
                                                                    {issue.isPremium && (
                                                                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight
                                                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedIssues.has(issue.id) ? 'rotate-90' : ''
                                                                }`}
                                                        />
                                                    </div>
                                                </button>

                                                {/* Issue Details */}
                                                <AnimatePresence>
                                                    {expandedIssues.has(issue.id) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden border-t border-gray-200"
                                                        >
                                                            <div className="p-4 bg-gray-50 space-y-3">
                                                                <div>
                                                                    <p className="text-sm text-gray-700 mb-2">
                                                                        {issue.description}
                                                                    </p>
                                                                </div>

                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                                    <div className="flex items-start gap-2">
                                                                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-blue-900 mb-1">
                                                                                Suggestion
                                                                            </p>
                                                                            <p className="text-sm text-blue-800">
                                                                                {issue.suggestion}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {issue.example && (
                                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                        <p className="text-xs font-semibold text-green-900 mb-1">
                                                                            Example
                                                                        </p>
                                                                        <p className="text-sm text-green-800 font-mono">
                                                                            {issue.example}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

function analyzeResume(resumeData: any, atsScore: any): ATSCategory[] {
    const categories: ATSCategory[] = [];

    // Content Analysis
    const contentIssues = analyzeContent(resumeData);
    const contentScore = atsScore?.breakdown?.content || 0;
    categories.push({
        id: 'content',
        title: 'Content',
        icon: <FileText className="w-4 h-4" />,
        score: contentScore,
        issues: contentIssues,
        color: contentScore >= 70 ? 'bg-green-100' : 'bg-red-100'
    });

    // Sections Analysis
    const sectionsIssues = analyzeSections(resumeData);
    const sectionsScore = atsScore?.breakdown?.completeness || 0;
    categories.push({
        id: 'sections',
        title: 'Sections',
        icon: <Bookmark className="w-4 h-4" />,
        score: sectionsScore,
        issues: sectionsIssues,
        color: sectionsScore >= 80 ? 'bg-green-100' : 'bg-yellow-100'
    });

    // ATS Essentials
    const atsEssentialsIssues = analyzeATSEssentials(resumeData);
    const atsEssentialsScore = atsScore?.breakdown?.formatting || 0;
    categories.push({
        id: 'ats-essentials',
        title: 'ATS Essentials',
        icon: <Shield className="w-4 h-4" />,
        score: atsEssentialsScore,
        issues: atsEssentialsIssues,
        color: atsEssentialsScore >= 80 ? 'bg-green-100' : 'bg-yellow-100'
    });

    // Tailoring (Job Match)
    const tailoringIssues = analyzeTailoring(resumeData);
    const tailoringScore = atsScore?.breakdown?.keywords || 0;
    categories.push({
        id: 'tailoring',
        title: 'Tailoring',
        icon: <Target className="w-4 h-4" />,
        score: tailoringScore,
        issues: tailoringIssues,
        color: tailoringScore >= 70 ? 'bg-green-100' : 'bg-orange-100'
    });

    return categories;
}

function analyzeContent(data: any): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // Analyze quantifying impact
    const allBullets = [
        ...data.experience?.flatMap((e: any) => [...(e.responsibilities || []), ...(e.achievements || [])]) || [],
        ...data.projects?.flatMap((p: any) => p.highlights || []) || []
    ];

    const bulletsWithNumbers = allBullets.filter((b: string) => /\d+/.test(b)).length;
    const quantificationRate = allBullets.length > 0 ? (bulletsWithNumbers / allBullets.length) * 100 : 0;

    if (quantificationRate < 50) {
        issues.push({
            id: 'quantifying-impact',
            title: 'Quantifying Impact',
            severity: 'critical',
            description: `Only ${Math.round(quantificationRate)}% of your bullet points include quantifiable metrics. Recruiters look for measurable achievements.`,
            suggestion: 'Add specific numbers, percentages, or metrics to demonstrate your impact',
            example: 'Instead of "Improved sales" → "Increased sales by 35% ($2.5M) in Q4 2023"',
            isPremium: true
        });
    }

    // Analyze repetition
    const words = allBullets.join(' ').toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
        if (word.length > 5) {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
    });
    const repeatedWords = Array.from(wordFreq.entries()).filter(([_, count]) => count > 5);

    if (repeatedWords.length > 0) {
        issues.push({
            id: 'repetition',
            title: 'Repetition',
            severity: 'warning',
            description: `You're overusing words like: ${repeatedWords.slice(0, 3).map(([w]) => w).join(', ')}`,
            suggestion: 'Use synonyms and vary your language to keep the resume engaging',
            example: 'Instead of repeating "managed" → use "led", "directed", "oversaw", "coordinated"'
        });
    }

    // Analyze action verbs
    const actionVerbs = ['achieved', 'improved', 'developed', 'created', 'managed', 'led', 'designed', 'implemented'];
    const bulletsWithActionVerbs = allBullets.filter((b: string) => {
        const firstWord = b.trim().split(/\s+/)[0].toLowerCase();
        return actionVerbs.includes(firstWord);
    }).length;
    const actionVerbRate = allBullets.length > 0 ? (bulletsWithActionVerbs / allBullets.length) * 100 : 0;

    if (actionVerbRate < 60) {
        issues.push({
            id: 'weak-verbs',
            title: 'Weak Action Verbs',
            severity: 'warning',
            description: `Only ${Math.round(actionVerbRate)}% of your bullet points start with strong action verbs`,
            suggestion: 'Start each bullet point with a powerful action verb',
            example: 'Use: Spearheaded, Orchestrated, Pioneered, Optimized, Transformed'
        });
    }

    return issues;
}

function analyzeSections(data: any): ATSIssue[] {
    const issues: ATSIssue[] = [];

    if (!data.personalInfo?.linkedin) {
        issues.push({
            id: 'contact-info',
            title: 'Contact Information',
            severity: 'critical',
            description: 'Missing LinkedIn profile URL',
            suggestion: 'Add your LinkedIn profile - 87% of recruiters use LinkedIn to vet candidates',
            example: 'linkedin.com/in/yourprofile'
        });
    }

    if (!data.personalInfo?.phone || data.personalInfo.phone.length < 10) {
        issues.push({
            id: 'phone-missing',
            title: 'Phone Number',
            severity: 'warning',
            description: 'Phone number is missing or incomplete',
            suggestion: 'Include a valid phone number with country code',
            example: '+1 (555) 123-4567'
        });
    }

    return issues;
}

function analyzeATSEssentials(data: any): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // Check for complex formatting
    const hasComplexFormatting = false; // This would need actual PDF analysis

    if (hasComplexFormatting) {
        issues.push({
            id: 'design',
            title: 'Design',
            severity: 'warning',
            description: 'Your resume may contain formatting that ATS systems cannot parse',
            suggestion: 'Use simple, clean formatting without tables, text boxes, or graphics',
            example: 'Stick to standard fonts, clear section headers, and bullet points'
        });
    }

    return issues;
}

function analyzeTailoring(data: any): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // This would analyze job description matching
    issues.push({
        id: 'job-match',
        title: 'Job Description Match',
        severity: 'info',
        description: 'Upload a job description to see how well your resume matches',
        suggestion: 'Tailor your resume to include keywords from the job posting',
        example: 'Match skills, technologies, and requirements mentioned in the job description'
    });

    return issues;
}
