'use client';

import { motion } from 'framer-motion';

interface ScoreDisplayProps {
    score: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
    breakdown?: {
        formatting: number;
        keywords: number;
        content: number;
        completeness: number;
    };
}

export default function ScoreDisplay({
    score,
    label = 'ATS Score',
    size = 'md',
    showDetails = false,
    breakdown,
}: ScoreDisplayProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const sizeClasses = {
        sm: { circle: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
        md: { circle: 'w-32 h-32', text: 'text-4xl', label: 'text-sm' },
        lg: { circle: 'w-40 h-40', text: 'text-5xl', label: 'text-base' },
    };

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative">
                <svg
                    className={`${sizeClasses[size].circle} transform -rotate-90`}
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={`bg-gradient-to-r ${getScoreGradient(score)}`}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: circumference,
                        }}
                        animate={{
                            strokeDashoffset,
                        }}
                        transition={{
                            duration: 1,
                            ease: 'easeOut',
                        }}
                        stroke="url(#scoreGradient)"
                    />
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop
                                offset="0%"
                                stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : '#ef4444'}
                            />
                            <stop
                                offset="100%"
                                stopColor={score >= 80 ? '#059669' : score >= 60 ? '#f97316' : '#ec4899'}
                            />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="text-center"
                    >
                        <div className={`${sizeClasses[size].text} font-bold ${getScoreColor(score)}`}>
                            {score}
                        </div>
                        <div className={`${sizeClasses[size].label} text-gray-500 dark:text-gray-400`}>
                            / 100
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Label */}
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{label}</p>

            {/* Breakdown */}
            {showDetails && breakdown && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 w-full max-w-md space-y-3"
                >
                    {Object.entries(breakdown).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                    {key}
                                </span>
                                <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                                    {value}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value}%` }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className={`h-full bg-gradient-to-r ${getScoreGradient(value)}`}
                                />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
