// Resume data types
export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    github?: string;
    photoUrl?: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    location?: string;
    achievements?: string[];
}

export interface Skill {
    category: string;
    items: string[];
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
    achievements: string[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
    highlights: string[];
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    education: Education[];
    skills: Skill[];
    experience: Experience[];
    projects: Project[];
    certifications: Certification[];
    customSection?: CustomSection;
}

export interface CustomSection {
    title: string;
    items: string[];
}

// ATS Score types
export interface ATSScore {
    overall: number;
    breakdown: {
        formatting: number;
        keywords: number;
        content: number;
        completeness: number;
    };
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
}

// Enhancement types
export interface EnhancementSuggestion {
    id: string;
    section: string;
    original: string;
    enhanced: string;
    reason: string;
    accepted: boolean;
}

export interface EnhancedResume {
    data: ResumeData;
    suggestions: EnhancementSuggestion[];
    atsScore: ATSScore;
}

// Template types
export type TemplateType = 'jake-resume' | 'professional-cv' | 'modern-resume';

export interface Template {
    id: TemplateType;
    name: string;
    description: string;
    preview: string;
    category: string;
}

// API response types
export interface ParseResponse {
    success: boolean;
    data?: ResumeData;
    error?: string;
}

export interface ATSScoreResponse {
    success: boolean;
    score?: ATSScore;
    error?: string;
}

export interface EnhanceResponse {
    success: boolean;
    enhanced?: ResumeData;
    suggestions?: EnhancementSuggestion[];
    error?: string;
}

export interface GenerateResponse {
    success: boolean;
    pdfUrl?: string;
    docxUrl?: string;
    error?: string;
}
