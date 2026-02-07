'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export default function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF or DOCX file');
            return false;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            return false;
        }

        setError(null);
        return true;
    };

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className="w-full">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                    } ${selectedFile ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
            >
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />

                <div className="p-12 text-center">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    Processing your resume...
                                </p>
                            </motion.div>
                        ) : selectedFile ? (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative">
                                    <FileText className="w-16 h-16 text-green-500 mb-4" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearFile();
                                        }}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Drop your resume here or click to browse
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supports PDF and DOCX files up to 10MB
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </motion.div>
            )}
        </div>
    );
}
