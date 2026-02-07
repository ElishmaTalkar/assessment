import { create } from 'zustand';
import { ResumeData, ATSScore, EnhancementSuggestion, TemplateType } from '@/lib/types';

interface ResumeStore {
    // Resume data
    originalResume: ResumeData | null;
    enhancedResume: ResumeData | null;

    // ATS scores
    originalScore: ATSScore | null;
    enhancedScore: ATSScore | null;

    // Enhancement
    suggestions: EnhancementSuggestion[];
    selectedTemplate: TemplateType;
    jobDescription?: string; // NEW

    // UI state
    isLoading: boolean;
    error: string | null;
    currentStep: 'upload' | 'create' | 'enhance' | 'generate';

    // Actions
    setOriginalResume: (resume: ResumeData) => void;
    setEnhancedResume: (resume: ResumeData) => void;
    setOriginalScore: (score: ATSScore) => void;
    setEnhancedScore: (score: ATSScore) => void;
    setSuggestions: (suggestions: EnhancementSuggestion[]) => void;
    setJobDescription: (jd: string) => void; // NEW
    acceptSuggestion: (id: string) => void;
    rejectSuggestion: (id: string) => void;
    setSelectedTemplate: (template: TemplateType) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setCurrentStep: (step: 'upload' | 'create' | 'enhance' | 'generate') => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
    // Initial state
    originalResume: null,
    enhancedResume: null,
    originalScore: null,
    enhancedScore: null,
    suggestions: [],
    selectedTemplate: 'jake-resume',
    jobDescription: '', // NEW
    isLoading: false,
    error: null,
    currentStep: 'upload',

    // Actions
    setOriginalResume: (resume) => set({ originalResume: resume }),

    setEnhancedResume: (resume) => set({ enhancedResume: resume }),

    setOriginalScore: (score) => set({ originalScore: score }),

    setEnhancedScore: (score) => set({ enhancedScore: score }),

    setSuggestions: (suggestions) => set({ suggestions }),

    setJobDescription: (jd) => set({ jobDescription: jd }), // NEW

    acceptSuggestion: (id) =>
        set((state) => ({
            suggestions: state.suggestions.map((s) =>
                s.id === id ? { ...s, accepted: true } : s
            ),
        })),

    rejectSuggestion: (id) =>
        set((state) => ({
            suggestions: state.suggestions.filter((s) => s.id !== id),
        })),

    setSelectedTemplate: (template) => set({ selectedTemplate: template }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    setCurrentStep: (step) => set({ currentStep: step }),

    reset: () =>
        set({
            originalResume: null,
            enhancedResume: null,
            originalScore: null,
            enhancedScore: null,
            suggestions: [],
            selectedTemplate: 'jake-resume',
            jobDescription: '', // NEW
            isLoading: false,
            error: null,
            currentStep: 'upload',
        }),
}));
