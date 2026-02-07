import { ResumeData, PersonalInfo, Education, Experience, Project, Skill, Certification } from './types';

/**
 * Parse resume text and extract structured data
 */

export function parseResumeText(text: string): Partial<ResumeData> {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const resumeData: Partial<ResumeData> = {
        personalInfo: extractPersonalInfo(lines, text),
        education: extractEducation(lines, text),
        skills: extractSkills(lines, text),
        experience: extractExperience(lines, text),
        projects: extractProjects(lines, text),
        certifications: extractCertifications(lines, text),
    };

    return resumeData;
}

function extractPersonalInfo(lines: string[], fullText: string): PersonalInfo {
    const personalInfo: PersonalInfo = {
        fullName: '',
        email: '',
        phone: '',
        location: '',
    };

    // Extract email
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) personalInfo.email = emailMatch[0];

    // Extract phone
    const phoneMatch = fullText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) personalInfo.phone = phoneMatch[0];

    // Extract LinkedIn
    const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/);
    if (linkedinMatch) personalInfo.linkedin = `https://${linkedinMatch[0]}`;

    // Extract GitHub
    const githubMatch = fullText.match(/github\.com\/[\w-]+/);
    if (githubMatch) personalInfo.github = `https://${githubMatch[0]}`;

    // Extract website
    const websiteMatch = fullText.match(/https?:\/\/[\w.-]+\.\w+/);
    if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
        personalInfo.website = websiteMatch[0];
    }

    // Extract name (usually first line or before email)
    const namePattern = /^([A-Z][a-z]+ )+[A-Z][a-z]+$/;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (namePattern.test(lines[i])) {
            personalInfo.fullName = lines[i];
            break;
        }
    }

    // Extract location (city, state pattern)
    const locationMatch = fullText.match(/([A-Z][a-z]+,\s*[A-Z]{2})|([A-Z][a-z]+,\s*[A-Z][a-z]+)/);
    if (locationMatch) personalInfo.location = locationMatch[0];

    return personalInfo;
}

function extractEducation(lines: string[], fullText: string): Education[] {
    const education: Education[] = [];
    const educationSection = extractSection(fullText, ['education', 'academic background']);

    if (!educationSection) return education;

    const degreePatterns = [
        /Bachelor|B\.S\.|B\.A\.|BS|BA/gi,
        /Master|M\.S\.|M\.A\.|MS|MA|MBA/gi,
        /Ph\.?D\.?|Doctorate/gi,
    ];

    const sectionLines = educationSection.split('\n').filter(Boolean);
    let currentEntry: Partial<Education> | null = null;

    sectionLines.forEach((line, index) => {
        // Check if line contains a degree
        const hasDegree = degreePatterns.some(pattern => pattern.test(line));

        if (hasDegree) {
            if (currentEntry) {
                education.push(currentEntry as Education);
            }

            currentEntry = {
                id: `edu-${education.length}`,
                institution: '',
                degree: line,
                field: '',
                startDate: '',
                endDate: '',
            };

            // Try to extract dates from the same line or next line
            const dateMatch = line.match(/(\d{4})\s*-\s*(\d{4}|Present)/i);
            if (dateMatch) {
                currentEntry.startDate = dateMatch[1];
                currentEntry.endDate = dateMatch[2];
            }
        } else if (currentEntry && !currentEntry.institution) {
            currentEntry.institution = line;
        }
    });

    if (currentEntry) {
        education.push(currentEntry as Education);
    }

    return education;
}

function extractSkills(lines: string[], fullText: string): Skill[] {
    const skills: Skill[] = [];
    const skillsSection = extractSection(fullText, ['skills', 'technical skills', 'core competencies']);

    if (!skillsSection) return skills;

    const sectionLines = skillsSection.split('\n').filter(Boolean);

    sectionLines.forEach(line => {
        // Check if line has a category (e.g., "Programming Languages:")
        const categoryMatch = line.match(/^([^:]+):\s*(.+)$/);

        if (categoryMatch) {
            const category = categoryMatch[1].trim();
            const items = categoryMatch[2].split(/[,;]/).map(s => s.trim()).filter(Boolean);
            skills.push({ category, items });
        } else {
            // If no category, split by commas
            const items = line.split(/[,;]/).map(s => s.trim()).filter(Boolean);
            if (items.length > 0) {
                skills.push({ category: 'General', items });
            }
        }
    });

    return skills;
}

function extractExperience(lines: string[], fullText: string): Experience[] {
    const experience: Experience[] = [];
    const expSection = extractSection(fullText, ['experience', 'work experience', 'professional experience', 'employment']);

    if (!expSection) return experience;

    const sectionLines = expSection.split('\n').filter(Boolean);
    let currentEntry: Partial<Experience> | null = null;

    sectionLines.forEach(line => {
        // Check for date pattern (likely a new entry)
        const dateMatch = line.match(/(\d{4}|[A-Z][a-z]{2}\s+\d{4})\s*-\s*(\d{4}|[A-Z][a-z]{2}\s+\d{4}|Present)/i);

        if (dateMatch) {
            if (currentEntry) {
                experience.push(currentEntry as Experience);
            }

            currentEntry = {
                id: `exp-${experience.length}`,
                company: '',
                position: '',
                location: '',
                startDate: dateMatch[1],
                endDate: dateMatch[2],
                current: dateMatch[2].toLowerCase() === 'present',
                responsibilities: [],
                achievements: [],
            };
        } else if (currentEntry) {
            // Check if it's a bullet point
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                const cleanLine = line.replace(/^[•\-*]\s*/, '');
                currentEntry.responsibilities!.push(cleanLine);
            } else if (!currentEntry.position) {
                currentEntry.position = line;
            } else if (!currentEntry.company) {
                currentEntry.company = line;
            }
        }
    });

    if (currentEntry) {
        experience.push(currentEntry as Experience);
    }

    return experience;
}

function extractProjects(lines: string[], fullText: string): Project[] {
    const projects: Project[] = [];
    const projectSection = extractSection(fullText, ['projects', 'personal projects', 'key projects']);

    if (!projectSection) return projects;

    const sectionLines = projectSection.split('\n').filter(Boolean);
    let currentEntry: Partial<Project> | null = null;

    for (const line of sectionLines) {
        // Check if line looks like a project title (not a bullet point)
        if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
            // Push previous entry if valid
            if (currentEntry && currentEntry.title) {
                projects.push(currentEntry as Project);
            }

            currentEntry = {
                id: `proj-${projects.length}`,
                title: line,
                description: '',
                technologies: [],
                highlights: [],
            };
        } else if (currentEntry) {
            const cleanLine = line.replace(/^[•\-*]\s*/, '');

            // Check if it's a technologies line
            if (cleanLine.toLowerCase().includes('technologies:') || cleanLine.toLowerCase().includes('tech stack:')) {
                const techMatch = cleanLine.match(/:\s*(.+)$/);
                if (techMatch) {
                    currentEntry.technologies = techMatch[1].split(/[,;]/).map(s => s.trim());
                }
            } else if (!currentEntry.description) {
                currentEntry.description = cleanLine;
            } else {
                currentEntry.highlights = currentEntry.highlights || [];
                currentEntry.highlights.push(cleanLine);
            }
        }
    }

    // Push last entry
    if (currentEntry && currentEntry.title) {
        projects.push(currentEntry as Project);
    }

    return projects;
}

function extractCertifications(lines: string[], fullText: string): Certification[] {
    const certifications: Certification[] = [];
    const certSection = extractSection(fullText, ['certifications', 'certificates', 'licenses']);

    if (!certSection) return certifications;

    const sectionLines = certSection.split('\n').filter(Boolean);

    sectionLines.forEach((line, index) => {
        const dateMatch = line.match(/(\d{4})/);

        certifications.push({
            id: `cert-${index}`,
            name: line.replace(/\d{4}/, '').trim(),
            issuer: '',
            date: dateMatch ? dateMatch[1] : '',
        });
    });

    return certifications;
}

function extractSection(text: string, headers: string[]): string | null {
    const lowerText = text.toLowerCase();

    for (const header of headers) {
        const headerIndex = lowerText.indexOf(header);
        if (headerIndex === -1) continue;

        // Find the start of the section (after the header)
        const sectionStart = headerIndex + header.length;

        // Find the end of the section (next major header or end of text)
        const nextHeaders = ['education', 'experience', 'skills', 'projects', 'certifications', 'references'];
        let sectionEnd = text.length;

        for (const nextHeader of nextHeaders) {
            if (nextHeader === header) continue;
            const nextIndex = lowerText.indexOf(nextHeader, sectionStart);
            if (nextIndex !== -1 && nextIndex < sectionEnd) {
                sectionEnd = nextIndex;
            }
        }

        return text.substring(sectionStart, sectionEnd).trim();
    }

    return null;
}
