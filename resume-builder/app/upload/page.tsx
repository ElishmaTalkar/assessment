'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/file-upload';
import ScoreDisplay from '@/components/ui/score-display';
import ProfessionalATSAnalysis from '@/components/ProfessionalATSAnalysis';
import { useResumeStore } from '@/store/resume-store';
import { ResumeData, ATSScore } from '@/lib/types';

export default function UploadPage() {
    const router = useRouter();
    const {
        setOriginalResume,
        setOriginalScore,
        setCurrentStep,
        setLoading,
        setError,
    } = useResumeStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<ResumeData | null>(null);
    const [atsScore, setAtsScore] = useState<ATSScore | null>(null);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        setLoading(true);
        setError(null);

        try {
            // Step 1: Parse the file
            const formData = new FormData();
            formData.append('file', file);

            const parseResponse = await fetch('/api/parse', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                throw new Error('Failed to parse resume');
            }

            const parseResult = await parseResponse.json();

            if (!parseResult.success) {
                throw new Error(parseResult.error || 'Failed to parse resume');
            }

            setParsedData(parseResult.data);
            setOriginalResume(parseResult.data);

            // Step 2: Calculate ATS score
            const scoreResponse = await fetch('/api/ats-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resumeData: parseResult.data }),
            });

            if (!scoreResponse.ok) {
                throw new Error('Failed to calculate ATS score');
            }

            const scoreResult = await scoreResponse.json();

            if (!scoreResult.success) {
                throw new Error(scoreResult.error || 'Failed to calculate ATS score');
            }

            setAtsScore(scoreResult.score);
            setOriginalScore(scoreResult.score);
            setCurrentStep('enhance');

            // Step 3: Get enhancement tips
            const tipsResponse = await fetch('/api/enhancement-tips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeData: parseResult.data,
                    atsScore: scoreResult.score
                }),
            });

            if (tipsResponse.ok) {
                const tipsResult = await tipsResponse.json();
                if (tipsResult.success) {
                    // setEnhancementTips(tipsResult.tips);
                }
            }

        } catch (error) {
            console.error('Upload error:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
            setLoading(false);
        }
    };

    const handleContinue = () => {
        router.push('/enhance');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Upload Your Resume
                        </h1>
                        <p className="text-xl text-gray-300">
                            Upload your existing resume to get instant ATS analysis and AI-powered improvements
                        </p>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-semibold text-white mb-6">
                                Step 1: Upload File
                            </h2>
                            <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />

                            {parsedData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                                >
                                    <p className="text-green-400 font-medium">
                                        ✓ Resume parsed successfully!
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Found {parsedData.experience?.length || 0} experience entries,{' '}
                                        {parsedData.education?.length || 0} education entries, and{' '}
                                        {parsedData.projects?.length || 0} projects
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {atsScore && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleContinue}
                                className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Continue to Enhancement
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Score Display Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-semibold text-white mb-6">
                                Step 2: ATS Analysis
                            </h2>

                            {atsScore ? (
                                <div>
                                    <ScoreDisplay
                                        score={atsScore.overall}
                                        label="Current ATS Score"
                                        size="lg"
                                        showDetails
                                        breakdown={atsScore.breakdown}
                                    />

                                    <div className="mt-8 space-y-4">
                                        {/* Strengths */}
                                        {atsScore.strengths.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-400 mb-2">
                                                    ✓ Strengths
                                                </h3>
                                                <ul className="space-y-2">
                                                    {atsScore.strengths.map((strength, index) => (
                                                        <li key={index} className="text-gray-300 text-sm">
                                                            • {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {atsScore.suggestions.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                                    💡 Suggestions
                                                </h3>
                                                <ul className="space-y-2">
                                                    {atsScore.suggestions.slice(0, 5).map((suggestion, index) => (
                                                        <li key={index} className="text-gray-300 text-sm">
                                                            • {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Sparkles className="w-16 h-16 text-gray-500 mb-4" />
                                    <p className="text-gray-400">
                                        Upload your resume to see your ATS score and get personalized suggestions
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Professional ATS Analysis */}
                {parsedData && atsScore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12"
                    >
                        <ProfessionalATSAnalysis resumeData={parsedData} atsScore={atsScore} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
