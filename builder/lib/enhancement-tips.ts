import { ResumeData, ATSScore } from './types';

export interface EnhancementTip {
    category: 'critical' | 'important' | 'recommended' | 'optional';
    section: string;
    issue: string;
    tip: string;
    example?: string;
    impact: 'high' | 'medium' | 'low';
}

export function generateEnhancementTips(resumeData: ResumeData, atsScore: ATSScore): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    // Personal Info Tips
    tips.push(...analyzePersonalInfo(resumeData));

    // Experience Tips
    tips.push(...analyzeExperience(resumeData));

    // Education Tips
    tips.push(...analyzeEducation(resumeData));

    // Skills Tips
    tips.push(...analyzeSkills(resumeData));

    // Projects Tips
    tips.push(...analyzeProjects(resumeData));

    // Certifications Tips
    tips.push(...analyzeCertifications(resumeData));

    // Content Quality Tips
    tips.push(...analyzeContentQuality(resumeData));

    // ATS-Specific Tips
    tips.push(...analyzeATSOptimization(resumeData, atsScore));

    // Sort by impact and category
    return tips.sort((a, b) => {
        const categoryOrder = { critical: 0, important: 1, recommended: 2, optional: 3 };
        const impactOrder = { high: 0, medium: 1, low: 2 };

        if (categoryOrder[a.category] !== categoryOrder[b.category]) {
            return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return impactOrder[a.impact] - impactOrder[b.impact];
    });
}

function analyzePersonalInfo(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (!data.personalInfo.fullName || data.personalInfo.fullName.length < 3) {
        tips.push({
            category: 'critical',
            section: 'Contact Information',
            issue: 'Missing or incomplete name',
            tip: 'Add your full name at the top of your resume in a clear, professional font',
            impact: 'high'
        });
    }

    if (!data.personalInfo.email || !data.personalInfo.email.includes('@')) {
        tips.push({
            category: 'critical',
            section: 'Contact Information',
            issue: 'Missing or invalid email address',
            tip: 'Include a professional email address (avoid nicknames or unprofessional handles)',
            example: 'john.doe@email.com instead of coolkid123@email.com',
            impact: 'high'
        });
    }

    if (!data.personalInfo.phone) {
        tips.push({
            category: 'important',
            section: 'Contact Information',
            issue: 'Missing phone number',
            tip: 'Add your phone number with country code for international applications',
            example: '+1 (555) 123-4567',
            impact: 'high'
        });
    }

    if (!data.personalInfo.location) {
        tips.push({
            category: 'recommended',
            section: 'Contact Information',
            issue: 'Missing location',
            tip: 'Include your city and state/country (helps with location-based job searches)',
            example: 'San Francisco, CA or Remote',
            impact: 'medium'
        });
    }

    if (!data.personalInfo.linkedin) {
        tips.push({
            category: 'important',
            section: 'Contact Information',
            issue: 'Missing LinkedIn profile',
            tip: 'Add your LinkedIn profile URL - 87% of recruiters use LinkedIn to vet candidates',
            example: 'linkedin.com/in/yourprofile',
            impact: 'high'
        });
    }

    if (!data.personalInfo.github && !data.personalInfo.website) {
        tips.push({
            category: 'recommended',
            section: 'Contact Information',
            issue: 'Missing portfolio/GitHub link',
            tip: 'For technical roles, include your GitHub profile or personal website to showcase projects',
            impact: 'medium'
        });
    }

    return tips;
}

function analyzeExperience(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (data.experience.length === 0) {
        tips.push({
            category: 'critical',
            section: 'Experience',
            issue: 'No work experience listed',
            tip: 'Add your work experience, internships, or relevant volunteer work',
            impact: 'high'
        });
        return tips;
    }

    if (data.experience.length < 2) {
        tips.push({
            category: 'recommended',
            section: 'Experience',
            issue: 'Limited work history',
            tip: 'Include internships, freelance work, or volunteer positions to show more experience',
            impact: 'medium'
        });
    }

    data.experience.forEach((exp, index) => {
        // Check for missing company
        if (!exp.company || exp.company.length < 2) {
            tips.push({
                category: 'critical',
                section: 'Experience',
                issue: `Experience entry ${index + 1}: Missing company name`,
                tip: 'Add the company name for this position',
                impact: 'high'
            });
        }

        // Check for missing position
        if (!exp.position || exp.position.length < 2) {
            tips.push({
                category: 'critical',
                section: 'Experience',
                issue: `Experience entry ${index + 1}: Missing job title`,
                tip: 'Add your job title/position for this role',
                impact: 'high'
            });
        }

        // Check for missing dates
        if (!exp.startDate || !exp.endDate) {
            tips.push({
                category: 'important',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: Missing dates`,
                tip: 'Include start and end dates (or "Present" for current roles)',
                example: 'Jan 2020 - Present',
                impact: 'high'
            });
        }

        // Check for missing location
        if (!exp.location) {
            tips.push({
                category: 'recommended',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: Missing location`,
                tip: 'Add the company location (city, state/country or "Remote")',
                impact: 'medium'
            });
        }

        // Check responsibilities
        if (exp.responsibilities.length === 0 && exp.achievements.length === 0) {
            tips.push({
                category: 'critical',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: No bullet points`,
                tip: 'Add 3-5 bullet points describing your key responsibilities and achievements',
                example: '• Developed scalable microservices handling 1M+ requests/day using Node.js',
                impact: 'high'
            });
        }

        if (exp.responsibilities.length > 0 && exp.responsibilities.length < 3) {
            tips.push({
                category: 'important',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: Too few bullet points`,
                tip: 'Add more bullet points (aim for 3-5 per role) to fully showcase your impact',
                impact: 'medium'
            });
        }

        // Check for quantifiable achievements
        const allText = [...exp.responsibilities, ...exp.achievements].join(' ');
        const hasNumbers = /\d+%|\d+\+|\$\d+|\d+x|\d+k/i.test(allText);

        if (!hasNumbers) {
            tips.push({
                category: 'important',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: No quantifiable metrics`,
                tip: 'Add numbers, percentages, or metrics to demonstrate impact',
                example: 'Instead of "Improved performance" → "Improved system performance by 40%, reducing load time from 3s to 1.8s"',
                impact: 'high'
            });
        }

        // Check for action verbs
        const actionVerbs = ['achieved', 'improved', 'developed', 'created', 'managed', 'led', 'designed', 'implemented', 'increased', 'reduced'];
        const hasActionVerbs = actionVerbs.some(verb => allText.toLowerCase().includes(verb));

        if (!hasActionVerbs) {
            tips.push({
                category: 'important',
                section: 'Experience',
                issue: `${exp.position || 'Position'}: Weak action verbs`,
                tip: 'Start bullet points with strong action verbs',
                example: 'Use: Led, Developed, Achieved, Optimized, Spearheaded instead of: Responsible for, Worked on, Helped with',
                impact: 'medium'
            });
        }

        // Check bullet point length
        exp.responsibilities.forEach((resp, i) => {
            if (resp.length < 30) {
                tips.push({
                    category: 'recommended',
                    section: 'Experience',
                    issue: `${exp.position || 'Position'}: Bullet point ${i + 1} too short`,
                    tip: 'Expand this bullet point with more detail about your impact and methods used',
                    impact: 'low'
                });
            }
            if (resp.length > 200) {
                tips.push({
                    category: 'recommended',
                    section: 'Experience',
                    issue: `${exp.position || 'Position'}: Bullet point ${i + 1} too long`,
                    tip: 'Shorten this bullet point - aim for 1-2 lines maximum',
                    impact: 'low'
                });
            }
        });
    });

    return tips;
}

function analyzeEducation(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (data.education.length === 0) {
        tips.push({
            category: 'critical',
            section: 'Education',
            issue: 'No education listed',
            tip: 'Add your educational background (degree, institution, graduation year)',
            impact: 'high'
        });
        return tips;
    }

    data.education.forEach((edu, index) => {
        if (!edu.institution || edu.institution.length < 2) {
            tips.push({
                category: 'critical',
                section: 'Education',
                issue: `Education entry ${index + 1}: Missing institution name`,
                tip: 'Add the name of your university or educational institution',
                impact: 'high'
            });
        }

        if (!edu.degree || edu.degree.length < 2) {
            tips.push({
                category: 'critical',
                section: 'Education',
                issue: `Education entry ${index + 1}: Missing degree`,
                tip: 'Specify your degree (e.g., Bachelor of Science in Computer Science)',
                impact: 'high'
            });
        }

        if (!edu.endDate) {
            tips.push({
                category: 'important',
                section: 'Education',
                issue: `${edu.institution || 'Institution'}: Missing graduation date`,
                tip: 'Add your graduation year or expected graduation date',
                example: '2020 or Expected May 2024',
                impact: 'medium'
            });
        }

        if (!edu.gpa) {
            tips.push({
                category: 'optional',
                section: 'Education',
                issue: `${edu.institution || 'Institution'}: No GPA listed`,
                tip: 'If your GPA is 3.5+ or you have academic achievements, include them',
                example: 'GPA: 3.8/4.0 or Dean\'s List',
                impact: 'low'
            });
        }
    });

    return tips;
}

function analyzeSkills(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (data.skills.length === 0) {
        tips.push({
            category: 'critical',
            section: 'Skills',
            issue: 'No skills listed',
            tip: 'Add a skills section with relevant technical and soft skills',
            example: 'Languages: JavaScript, Python, Java\nFrameworks: React, Node.js, Django\nTools: Git, Docker, AWS',
            impact: 'high'
        });
        return tips;
    }

    const totalSkills = data.skills.reduce((sum, cat) => sum + cat.items.length, 0);

    if (totalSkills < 5) {
        tips.push({
            category: 'important',
            section: 'Skills',
            issue: 'Too few skills listed',
            tip: 'Add more relevant skills (aim for 10-15 total across categories)',
            impact: 'medium'
        });
    }

    if (data.skills.length === 1 && totalSkills > 10) {
        tips.push({
            category: 'recommended',
            section: 'Skills',
            issue: 'Skills not categorized',
            tip: 'Organize skills into categories for better readability',
            example: 'Separate into: Languages, Frameworks, Tools, Soft Skills',
            impact: 'medium'
        });
    }

    return tips;
}

function analyzeProjects(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (data.projects.length === 0) {
        tips.push({
            category: 'important',
            section: 'Projects',
            issue: 'No projects listed',
            tip: 'Add 2-3 relevant projects to demonstrate practical skills',
            example: 'Personal projects, hackathons, open-source contributions, or academic projects',
            impact: 'high'
        });
        return tips;
    }

    data.projects.forEach((proj, index) => {
        if (!proj.title || proj.title.length < 2) {
            tips.push({
                category: 'critical',
                section: 'Projects',
                issue: `Project ${index + 1}: Missing title`,
                tip: 'Add a clear, descriptive title for this project',
                impact: 'high'
            });
        }

        if (!proj.description || proj.description.length < 20) {
            tips.push({
                category: 'important',
                section: 'Projects',
                issue: `${proj.title || 'Project'}: Missing or short description`,
                tip: 'Add a detailed description explaining what the project does and its purpose',
                impact: 'medium'
            });
        }

        if (proj.technologies.length === 0) {
            tips.push({
                category: 'important',
                section: 'Projects',
                issue: `${proj.title || 'Project'}: No technologies listed`,
                tip: 'List the technologies, frameworks, and tools used',
                example: 'React, Node.js, MongoDB, AWS',
                impact: 'high'
            });
        }

        if (proj.highlights.length === 0) {
            tips.push({
                category: 'recommended',
                section: 'Projects',
                issue: `${proj.title || 'Project'}: No highlights or achievements`,
                tip: 'Add 2-3 bullet points highlighting key features or achievements',
                example: '• Implemented real-time chat with WebSocket\n• Deployed to AWS with 99.9% uptime',
                impact: 'medium'
            });
        }

        if (!proj.link && !proj.github) {
            tips.push({
                category: 'recommended',
                section: 'Projects',
                issue: `${proj.title || 'Project'}: No demo or source link`,
                tip: 'Include a link to the live demo or GitHub repository',
                impact: 'medium'
            });
        }
    });

    return tips;
}

function analyzeCertifications(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (data.certifications.length === 0) {
        tips.push({
            category: 'optional',
            section: 'Certifications',
            issue: 'No certifications listed',
            tip: 'If you have relevant certifications, add them to stand out',
            example: 'AWS Certified Solutions Architect, Google Cloud Professional, etc.',
            impact: 'low'
        });
    }

    return tips;
}

function analyzeContentQuality(data: ResumeData): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    // Collect all text
    const allText = [
        ...data.experience.flatMap(e => [...e.responsibilities, ...e.achievements]),
        ...data.projects.flatMap(p => [p.description, ...p.highlights])
    ].join(' ');

    // Check for passive voice
    const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are'];
    const passiveCount = passiveIndicators.filter(word =>
        allText.toLowerCase().split(/\s+/).includes(word)
    ).length;

    if (passiveCount > 5) {
        tips.push({
            category: 'recommended',
            section: 'Content Quality',
            issue: 'Excessive passive voice',
            tip: 'Use active voice instead of passive voice for stronger impact',
            example: 'Instead of "Was responsible for managing" → "Managed"',
            impact: 'medium'
        });
    }

    // Check for repetition
    const words = allText.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
        if (word.length > 5) {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
    });

    const repeatedWords = Array.from(wordFreq.entries())
        .filter(([_, count]) => count > 5)
        .map(([word]) => word);

    if (repeatedWords.length > 0) {
        tips.push({
            category: 'recommended',
            section: 'Content Quality',
            issue: 'Repetitive language',
            tip: `Avoid overusing words like: ${repeatedWords.slice(0, 3).join(', ')}. Use synonyms for variety`,
            impact: 'low'
        });
    }

    return tips;
}

function analyzeATSOptimization(data: ResumeData, atsScore: ATSScore): EnhancementTip[] {
    const tips: EnhancementTip[] = [];

    if (atsScore.overall < 60) {
        tips.push({
            category: 'critical',
            section: 'ATS Optimization',
            issue: 'Low ATS score',
            tip: 'Your resume may not pass Applicant Tracking Systems. Focus on the critical issues first',
            impact: 'high'
        });
    }

    if (atsScore.breakdown.keywords < 70) {
        tips.push({
            category: 'important',
            section: 'ATS Optimization',
            issue: 'Low keyword score',
            tip: 'Add more industry-specific keywords and technical terms relevant to your target role',
            impact: 'high'
        });
    }

    if (atsScore.breakdown.formatting < 80) {
        tips.push({
            category: 'important',
            section: 'ATS Optimization',
            issue: 'Formatting issues',
            tip: 'Use consistent formatting, standard section headers, and avoid tables/graphics that ATS can\'t parse',
            impact: 'high'
        });
    }

    return tips;
}
