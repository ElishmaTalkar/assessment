import { ResumeData, ATSScore } from './types';

/**
 * Advanced ATS scoring algorithm with personalized, content-aware analysis
 * Provides specific, actionable feedback based on actual resume content
 */

const ACTION_VERBS = [
    'achieved', 'improved', 'developed', 'created', 'managed', 'led', 'designed',
    'implemented', 'increased', 'reduced', 'optimized', 'streamlined', 'launched',
    'built', 'established', 'coordinated', 'executed', 'delivered', 'analyzed',
    'collaborated', 'spearheaded', 'transformed', 'generated', 'accelerated',
    'engineered', 'architected', 'pioneered', 'drove', 'initiated', 'orchestrated',
    'revamped', 'enhanced', 'automated', 'scaled', 'modernized', 'integrated'
];

const WEAK_VERBS = [
    'responsible for', 'worked on', 'helped with', 'assisted', 'participated',
    'involved in', 'tasked with', 'duties included', 'was part of'
];

const TECHNICAL_KEYWORDS = [
    'api', 'database', 'cloud', 'agile', 'scrum', 'ci/cd', 'devops', 'frontend',
    'backend', 'fullstack', 'architecture', 'scalable', 'performance', 'security',
    'testing', 'deployment', 'integration', 'automation', 'optimization', 'microservices',
    'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'react', 'angular', 'vue',
    'node', 'python', 'java', 'typescript', 'javascript', 'sql', 'nosql'
];

export function calculateATSScore(resumeData: ResumeData, jobDescription?: string): ATSScore {
    const scores = {
        formatting: calculateFormattingScore(resumeData),
        keywords: jobDescription
            ? calculateKeywordScoreWithJD(resumeData, jobDescription)
            : calculateKeywordScore(resumeData),
        content: calculateContentScore(resumeData),
        completeness: calculateCompletenessScore(resumeData),
    };

    const overall = Math.round(
        (scores.formatting * 0.25 +
            scores.keywords * 0.30 +
            scores.content * 0.25 +
            scores.completeness * 0.20)
    );

    const { suggestions, strengths, weaknesses } = generatePersonalizedFeedback(resumeData, scores, jobDescription);

    return {
        overall,
        breakdown: scores,
        suggestions,
        strengths,
        weaknesses,
    };
}

function calculateFormattingScore(data: ResumeData): number {
    let score = 100;
    const issues: string[] = [];

    // If completely empty, give minimal score
    if (data.education.length === 0 && data.experience.length === 0 && data.projects.length === 0) {
        return 20;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.personalInfo.email)) {
        score -= 10;
        issues.push('Invalid email format');
    }

    // Phone validation
    const phoneRegex = /[\d\(\)\-\+\s]{10,}/;
    if (!phoneRegex.test(data.personalInfo.phone)) {
        score -= 5;
        issues.push('Phone number missing or invalid');
    }

    // Date consistency check
    const allDates = [
        ...data.education.flatMap(e => [e.startDate, e.endDate]),
        ...data.experience.flatMap(e => [e.startDate, e.endDate]),
    ].filter(d => d);

    if (allDates.length > 0) {
        // Check for consistent date formats
        const hasMonthYear = allDates.some(d => /[A-Za-z]{3,}\s+\d{4}/.test(d));
        const hasSlashFormat = allDates.some(d => /\d+\/\d+/.test(d));
        const hasYearOnly = allDates.some(d => /^\d{4}$/.test(d));

        const formatCount = [hasMonthYear, hasSlashFormat, hasYearOnly].filter(Boolean).length;
        if (formatCount > 1) {
            score -= 10;
            issues.push('Inconsistent date formats');
        }
    }

    // Bullet point analysis
    const totalBullets = data.experience.reduce(
        (sum, exp) => sum + exp.responsibilities.length + exp.achievements.length,
        0
    ) + data.projects.reduce(
        (sum, proj) => sum + proj.highlights.length,
        0
    );

    if (totalBullets < 5) {
        score -= 15;
        issues.push('Too few bullet points');
    } else if (totalBullets > 30) {
        score -= 5;
        issues.push('Too many bullet points - may be overwhelming');
    }

    // Check for consistent bullet point structure
    const allBullets = [
        ...data.experience.flatMap(e => [...e.responsibilities, ...e.achievements]),
        ...data.projects.flatMap(p => p.highlights)
    ];

    const startsWithActionVerb = allBullets.filter(bullet => {
        const firstWord = bullet.trim().split(/\s+/)[0].toLowerCase();
        return ACTION_VERBS.includes(firstWord);
    }).length;

    const actionVerbPercentage = allBullets.length > 0 ? (startsWithActionVerb / allBullets.length) * 100 : 0;
    if (actionVerbPercentage < 50) {
        score -= 10;
        issues.push('Many bullet points don\'t start with action verbs');
    }

    return Math.max(0, score);
}

function calculateKeywordScore(data: ResumeData): number {
    let score = 0;
    const analysis = {
        actionVerbs: 0,
        weakVerbs: 0,
        technicalKeywords: 0,
        quantifiableAchievements: 0,
        totalWords: 0
    };

    // Collect all text content
    const allText = [
        ...data.experience.flatMap(e => [...e.responsibilities, ...e.achievements]),
        ...data.projects.flatMap(p => [p.description, ...p.highlights]),
        ...data.skills.flatMap(s => s.items),
    ].join(' ').toLowerCase();

    analysis.totalWords = allText.split(/\s+/).length;

    // Check for strong action verbs
    const uniqueActionVerbs = new Set<string>();
    ACTION_VERBS.forEach(verb => {
        if (allText.includes(verb)) {
            uniqueActionVerbs.add(verb);
        }
    });
    analysis.actionVerbs = uniqueActionVerbs.size;

    // More action verbs = better score (up to 35 points)
    score += Math.min(35, analysis.actionVerbs * 2);

    // Check for weak verbs (penalize)
    WEAK_VERBS.forEach(weakVerb => {
        if (allText.includes(weakVerb)) {
            analysis.weakVerbs++;
            score -= 3;
        }
    });

    // Check for technical keywords
    const uniqueTechKeywords = new Set<string>();
    TECHNICAL_KEYWORDS.forEach(keyword => {
        if (allText.includes(keyword)) {
            uniqueTechKeywords.add(keyword);
        }
    });
    analysis.technicalKeywords = uniqueTechKeywords.size;

    // More technical keywords = better score (up to 30 points)
    score += Math.min(30, analysis.technicalKeywords * 2);

    // Check for quantifiable achievements (numbers, percentages, metrics)
    const quantifiableMatches = allText.match(/\d+%|\d+\+|(\$\d+)|(\d+x)|\d+k|\d+m|(\d+\s*(million|billion|thousand))/gi);
    if (quantifiableMatches) {
        analysis.quantifiableAchievements = quantifiableMatches.length;
        // More quantification = better score (up to 35 points)
        score += Math.min(35, quantifiableMatches.length * 4);
    }

    // Keyword density check
    if (analysis.totalWords > 0) {
        const keywordDensity = ((analysis.actionVerbs + analysis.technicalKeywords) / analysis.totalWords) * 100;
        if (keywordDensity < 2) {
            score -= 10; // Too few keywords relative to content
        } else if (keywordDensity > 15) {
            score -= 5; // Keyword stuffing
        }
    }

    return Math.max(0, Math.min(100, score));
}

function calculateKeywordScoreWithJD(data: ResumeData, jobDescription: string): number {
    let score = 0;

    const resumeText = [
        data.personalInfo.fullName,
        ...data.experience.flatMap(e => [e.position, e.company, ...e.responsibilities, ...e.achievements]),
        ...data.projects.flatMap(p => [p.title, p.description, ...p.highlights, ...p.technologies]),
        ...data.skills.flatMap(s => s.items),
        ...data.education.flatMap(e => [e.degree, e.field, e.institution])
    ].join(' ').toLowerCase();

    // Extract meaningful keywords from JD
    const stopWords = new Set(['and', 'the', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'on', 'at', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'it', 'from', 'as', 'or', 'but', 'not', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'also', 'well', 'only', 'may', 'must', 'would', 'could', 'our', 'your', 'their', 'has', 'have', 'had', 'do', 'does', 'did', 'make', 'made', 'get', 'got', 'give', 'gave']);

    const jdWords = jobDescription
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequency of each keyword in JD
    const jdKeywordFreq = new Map<string, number>();
    jdWords.forEach(word => {
        jdKeywordFreq.set(word, (jdKeywordFreq.get(word) || 0) + 1);
    });

    // Get top keywords (mentioned more than once)
    const importantKeywords = Array.from(jdKeywordFreq.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word);

    const allUniqueKeywords = Array.from(new Set(jdWords));

    if (allUniqueKeywords.length === 0) return calculateKeywordScore(data);

    // Calculate match scores
    const importantMatches = importantKeywords.filter(keyword => resumeText.includes(keyword));
    const allMatches = allUniqueKeywords.filter(keyword => resumeText.includes(keyword));

    // Weight important keywords more heavily
    const importantMatchScore = importantKeywords.length > 0
        ? (importantMatches.length / importantKeywords.length) * 60
        : 0;

    const generalMatchScore = (allMatches.length / allUniqueKeywords.length) * 40;

    score = Math.round(importantMatchScore + generalMatchScore);

    return Math.min(100, Math.max(0, score));
}

function calculateContentScore(data: ResumeData): number {
    let score = 100;

    // If no main content exists, return minimal score
    if (data.experience.length === 0 && data.projects.length === 0 && data.skills.length === 0) {
        return 15;
    }

    // Analyze experience quality
    data.experience.forEach(exp => {
        const allBullets = [...exp.responsibilities, ...exp.achievements];

        allBullets.forEach(bullet => {
            const words = bullet.split(/\s+/).length;

            // Too short (less than 8 words)
            if (words < 8) {
                score -= 3;
            }
            // Too long (more than 40 words)
            else if (words > 40) {
                score -= 2;
            }

            // Check if starts with weak phrase
            const lowerBullet = bullet.toLowerCase();
            if (WEAK_VERBS.some(weak => lowerBullet.startsWith(weak))) {
                score -= 2;
            }

            // Check for passive voice indicators
            if (/\b(was|were|been|being)\s+\w+ed\b/.test(lowerBullet)) {
                score -= 1;
            }

            // Reward quantification
            if (/\d+/.test(bullet)) {
                score += 1;
            }
        });

        // Penalize if no achievements listed
        if (exp.achievements.length === 0 && exp.responsibilities.length > 0) {
            score -= 5;
        }

        // Reward good balance
        if (exp.achievements.length > 0 && exp.responsibilities.length > 0) {
            score += 2;
        }
    });

    // Analyze project quality
    data.projects.forEach(proj => {
        // Check description quality
        const descWords = proj.description.split(/\s+/).length;
        if (descWords < 10) {
            score -= 4;
        } else if (descWords > 15 && descWords < 40) {
            score += 2; // Good length
        }

        // Technologies listed
        if (proj.technologies.length === 0) {
            score -= 5;
        } else if (proj.technologies.length >= 3) {
            score += 2;
        }

        // Highlights/achievements
        if (proj.highlights.length === 0) {
            score -= 3;
        } else if (proj.highlights.length >= 2) {
            score += 2;
        }

        // Links provided
        if (proj.link || proj.github) {
            score += 2;
        }
    });

    // Analyze skills organization
    if (data.skills.length === 0) {
        score -= 20;
    } else {
        const totalSkills = data.skills.reduce((sum, cat) => sum + cat.items.length, 0);

        if (totalSkills < 5) {
            score -= 15;
        } else if (totalSkills >= 10 && totalSkills <= 20) {
            score += 5; // Good range
        } else if (totalSkills > 30) {
            score -= 5; // Too many
        }

        // Reward categorization
        if (data.skills.length > 1) {
            score += 3;
        }
    }

    return Math.max(0, Math.min(100, score));
}

function calculateCompletenessScore(data: ResumeData): number {
    let score = 0;

    // Personal info (30 points total)
    if (data.personalInfo.fullName && data.personalInfo.fullName.length > 2) score += 5;
    if (data.personalInfo.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email)) score += 5;
    if (data.personalInfo.phone && data.personalInfo.phone.length >= 10) score += 5;
    if (data.personalInfo.location && data.personalInfo.location.length > 2) score += 5;
    if (data.personalInfo.linkedin) score += 5;
    if (data.personalInfo.website || data.personalInfo.github) score += 5;

    // Education (20 points)
    if (data.education.length > 0) {
        score += 15;
        // Bonus for complete education entries
        const completeEducation = data.education.filter(e =>
            e.institution && e.degree && e.endDate
        ).length;
        if (completeEducation === data.education.length) score += 5;
    }

    // Experience (25 points)
    if (data.experience.length > 0) {
        score += 10;
        if (data.experience.length >= 2) score += 8;
        if (data.experience.length >= 3) score += 7;

        // Bonus for complete experience entries
        const completeExperience = data.experience.filter(e =>
            e.company && e.position && e.startDate && e.endDate &&
            (e.responsibilities.length > 0 || e.achievements.length > 0)
        ).length;
        if (completeExperience === data.experience.length) score += 0; // Already counted above
    }

    // Skills (15 points)
    if (data.skills.length > 0) {
        const totalSkills = data.skills.reduce((sum, cat) => sum + cat.items.length, 0);
        if (totalSkills >= 5) score += 15;
        else score += totalSkills * 3;
    }

    // Projects (10 points)
    if (data.projects.length > 0) {
        score += 5;
        if (data.projects.length >= 2) score += 5;
    }

    return Math.min(100, score);
}

function generatePersonalizedFeedback(
    data: ResumeData,
    scores: { formatting: number; keywords: number; content: number; completeness: number },
    jobDescription?: string
): { suggestions: string[]; strengths: string[]; weaknesses: string[] } {
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Collect actual content for analysis
    const allBullets = [
        ...data.experience.flatMap(e => [...e.responsibilities, ...e.achievements]),
        ...data.projects.flatMap(p => p.highlights)
    ];
    const allText = allBullets.join(' ').toLowerCase();

    // Analyze actual action verb usage
    const actionVerbCount = ACTION_VERBS.filter(verb => allText.includes(verb)).length;
    const weakVerbCount = WEAK_VERBS.filter(weak => allText.includes(weak)).length;

    // Analyze quantification
    const quantifiableMatches = allText.match(/\d+%|\d+\+|(\$\d+)|(\d+x)|\d+k/gi);
    const quantificationCount = quantifiableMatches ? quantifiableMatches.length : 0;

    // Formatting feedback
    if (scores.formatting < 80) {
        if (allBullets.length > 0) {
            const bulletsWithActionVerbs = allBullets.filter(b => {
                const firstWord = b.trim().split(/\s+/)[0].toLowerCase();
                return ACTION_VERBS.includes(firstWord);
            }).length;
            const percentage = Math.round((bulletsWithActionVerbs / allBullets.length) * 100);
            suggestions.push(`Only ${percentage}% of your bullet points start with strong action verbs - aim for 80%+`);
        }
        weaknesses.push('Formatting and structure need improvement');
    } else {
        strengths.push(`Well-formatted resume with ${allBullets.length} clear bullet points`);
    }

    // Keyword feedback
    if (scores.keywords < 70) {
        if (actionVerbCount < 5) {
            suggestions.push(`You're using only ${actionVerbCount} different action verbs - add more variety (achieved, spearheaded, optimized, etc.)`);
        }
        if (weakVerbCount > 0) {
            suggestions.push(`Remove ${weakVerbCount} instances of weak phrases like "responsible for" or "worked on"`);
        }
        if (quantificationCount < 3) {
            suggestions.push(`Add specific metrics - currently only ${quantificationCount} quantified achievements found`);
        }
        weaknesses.push('Limited use of impactful keywords and metrics');
    } else {
        strengths.push(`Strong keyword optimization with ${actionVerbCount} action verbs and ${quantificationCount} quantified achievements`);
    }

    // Content feedback
    if (scores.content < 75) {
        const shortBullets = allBullets.filter(b => b.split(/\s+/).length < 8).length;
        if (shortBullets > 0) {
            suggestions.push(`${shortBullets} bullet points are too short - expand with more detail about impact and methods`);
        }

        const experienceWithoutAchievements = data.experience.filter(e => e.achievements.length === 0).length;
        if (experienceWithoutAchievements > 0) {
            suggestions.push(`${experienceWithoutAchievements} experience entries lack achievement bullets - add measurable results`);
        }

        weaknesses.push('Content lacks depth and specific achievements');
    } else {
        strengths.push(`Comprehensive content with ${allBullets.length} detailed bullet points`);
    }

    // Completeness feedback
    if (scores.completeness < 80) {
        const missing: string[] = [];
        if (!data.personalInfo.linkedin) missing.push('LinkedIn profile');
        if (!data.personalInfo.github && !data.personalInfo.website) missing.push('portfolio/GitHub link');
        if (data.experience.length < 2) missing.push('more work experience');
        if (data.projects.length === 0) missing.push('projects section');
        if (data.skills.length === 0) missing.push('skills section');

        if (missing.length > 0) {
            suggestions.push(`Add: ${missing.join(', ')}`);
        }
        weaknesses.push('Resume is missing key sections');
    } else {
        const totalSkills = data.skills.reduce((sum, cat) => sum + cat.items.length, 0);
        strengths.push(`Complete resume with ${data.experience.length} experiences, ${data.projects.length} projects, and ${totalSkills} skills`);
    }

    // Job description specific feedback
    if (jobDescription && scores.keywords < 80) {
        suggestions.push('Tailor your resume to better match the job description keywords');
    }

    return { suggestions, strengths, weaknesses };
}

export function compareScores(before: ATSScore, after: ATSScore): {
    improvement: number;
    changes: { section: string; before: number; after: number; change: number }[];
} {
    const improvement = after.overall - before.overall;
    const changes = [
        {
            section: 'Formatting',
            before: before.breakdown.formatting,
            after: after.breakdown.formatting,
            change: after.breakdown.formatting - before.breakdown.formatting,
        },
        {
            section: 'Keywords',
            before: before.breakdown.keywords,
            after: after.breakdown.keywords,
            change: after.breakdown.keywords - before.breakdown.keywords,
        },
        {
            section: 'Content',
            before: before.breakdown.content,
            after: after.breakdown.content,
            change: after.breakdown.content - before.breakdown.content,
        },
        {
            section: 'Completeness',
            before: before.breakdown.completeness,
            after: after.breakdown.completeness,
            change: after.breakdown.completeness - before.breakdown.completeness,
        },
    ];

    return { improvement, changes };
}
