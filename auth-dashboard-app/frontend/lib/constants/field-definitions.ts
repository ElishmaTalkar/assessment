import { Code, Microscope, Bug, FileText, DollarSign, Layers } from 'lucide-react';

export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'url' | 'select' | 'toggle' | 'textarea' | 'file';

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    options?: string[]; // For select inputs
    placeholder?: string;
    required?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
}

export interface CategoryDefinition {
    id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    fields: FieldDefinition[];
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
    'Finance': {
        id: 'Finance',
        label: 'Finance',
        icon: DollarSign,
        color: 'bg-emerald-500',
        fields: [
            { name: 'budgetCeiling', label: 'Budget Ceiling', type: 'currency', placeholder: 'Max spend limit' },
            { name: 'actualCost', label: 'Actual Cost', type: 'currency', placeholder: 'Amount spent' },
            { name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'INR', 'EUR', 'GBP'] },
            { name: 'subscriptionName', label: 'Subscription Name', type: 'text', placeholder: 'Netflix, AWS, etc.' },
            { name: 'courseCost', label: 'Learning Investment', type: 'currency', placeholder: 'Course cost' },
            { name: 'wishlistItem', label: 'Wishlist Item', type: 'text', placeholder: 'Reward for completion' },
            { name: 'hourlyRate', label: 'Freelance Rate', type: 'currency', placeholder: 'Hourly Rate' },
            { name: 'taxDocLink', label: 'Tax Doc Link', type: 'url', placeholder: 'Drive Link' },
            { name: 'budgetRemaining', label: 'Monthly Budget Left', type: 'currency', placeholder: 'Fun money left' },
            { name: 'invoiceGenerated', label: 'Invoice Generated?', type: 'toggle' },
            { name: 'billDueDate', label: 'Bill Due Date', type: 'date' },
        ]
    },
    'Development': {
        id: 'Development',
        label: 'Development',
        icon: Code,
        color: 'bg-blue-500',
        fields: [
            { name: 'commitLink', label: 'Commit / PR Link', type: 'url', placeholder: 'https://github.com/...' },
            { name: 'techStack', label: 'Language/Framework', type: 'select', options: ['React', 'Node.js', 'Python', 'TypeScript', 'Other'] },
            { name: 'environment', label: 'Environment', type: 'select', options: ['Frontend', 'Backend', 'Database', 'DevOps'] },
            { name: 'complexity', label: 'Complexity (Fibonacci)', type: 'select', options: ['1', '2', '3', '5', '8', '13'] },
            { name: 'isTechDebt', label: 'Technical Debt', type: 'toggle' },
            { name: 'buildStatus', label: 'Build Status', type: 'select', options: ['Passing', 'Failing', 'Unknown'] },
            { name: 'prStatus', label: 'PR Status', type: 'select', options: ['Open', 'In Review', 'Merged', 'Closed'] },
            { name: 'unitTestCoverage', label: 'Test Coverage (%)', type: 'number', placeholder: '80' },
        ]
    },
    'Research': {
        id: 'Research',
        label: 'Research',
        icon: Microscope,
        color: 'bg-purple-500',
        fields: [
            { name: 'hypothesis', label: 'Hypothesis Statement', type: 'textarea', placeholder: 'We believe that...' },
            { name: 'sourceLink', label: 'Knowledge Source', type: 'url', placeholder: 'Link to doc/paper' },
            { name: 'feasibilityScore', label: 'Feasibility (1-10)', type: 'number', placeholder: '7' },
            { name: 'pocLink', label: 'PoC Link', type: 'url', placeholder: 'Sandbox URL' },
            { name: 'competitorBenchmark', label: 'Competitor Benchmarking', type: 'textarea', placeholder: 'How others do it...' },
            { name: 'stakeholderImpact', label: 'Key Stakeholder', type: 'text', placeholder: 'Who benefits?' },
            { name: 'decisionLog', label: 'Decision Log', type: 'textarea', placeholder: 'Why this path?' },
        ]
    },
    'Quality': {
        id: 'Quality',
        label: 'Quality & Testing',
        icon: Bug,
        color: 'bg-rose-500',
        fields: [
            { name: 'severity', label: 'Severity', type: 'select', options: ['Blocker', 'Critical', 'Major', 'Minor'] },
            { name: 'stepsToReproduce', label: 'Steps to Reproduce', type: 'textarea', placeholder: '1. Go to... 2. Click...' },
            { name: 'deviceBrowser', label: 'Device/Browser', type: 'text', placeholder: 'Chrome / iOS 15' },
            { name: 'testCaseId', label: 'Test Case ID', type: 'text', placeholder: 'TC-101' },
            { name: 'isRegression', label: 'Regression', type: 'toggle' },
            { name: 'performanceMetric', label: 'Performance Metric', type: 'text', placeholder: 'Load time: 1.2s' },
            { name: 'userAcceptance', label: 'UAT Approved', type: 'toggle' },
        ]
    },
    'Admin': {
        id: 'Admin',
        label: 'Documentation',
        icon: FileText,
        color: 'bg-slate-500',
        fields: [
            { name: 'docType', label: 'Format', type: 'select', options: ['Markdown', 'PDF', 'Wiki', 'Video'] },
            { name: 'audience', label: 'Audience', type: 'select', options: ['Developer', 'End-User', 'Management'] },
            { name: 'wordCount', label: 'Word Count', type: 'number', placeholder: '0' },
            { name: 'updateFrequency', label: 'Update Frequency', type: 'select', options: ['One-time', 'Weekly', 'Per Release'] },
            { name: 'isPublished', label: 'Published', type: 'toggle' },
            { name: 'lastUpdated', label: 'Last Updated', type: 'date' },
        ]
    },
    'Other': {
        id: 'Other',
        label: 'Custom / Other',
        icon: Layers,
        color: 'bg-teal-500',
        fields: [
            { name: 'customGoal', label: 'Objective / Goal', type: 'textarea', placeholder: 'What is the main objective?' },
            { name: 'customNotes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any specific details...' },
            { name: 'customLink', label: 'Relevant Link', type: 'url', placeholder: 'https://...' },
            { name: 'poc', label: 'Point of Contact', type: 'text', placeholder: 'Name or Department' },
            { name: 'isUrgent', label: 'Is Urgent?', type: 'toggle' },
        ]
    }
};

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_DEFINITIONS);
