"use strict";
import React from 'react'; // Explicitly import React
import { ResumeData, TemplateType } from '@/lib/types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

interface ResumePreviewProps {
    data: ResumeData;
    template: TemplateType;
    id?: string; // For PDF generation referencing
}

export default function ResumePreview({ data, template, id = "resume-preview" }: ResumePreviewProps) {
    if (!data) return null;

    const { personalInfo, education, skills, experience, projects, certifications, customSection } = data;

    // --- Template: Jake's Resume (Minimalist, compact) ---
    if (template === 'jake-resume') {
        // Dynamic Scaling Logic
        const totalChars = [
            JSON.stringify(experience),
            JSON.stringify(projects),
            JSON.stringify(education),
            JSON.stringify(skills)
        ].join('').length;

        // Determine Scale Factor based on content length
        // Short content (< 2000 chars) -> Large Fonts
        // Medium content (2000-3500 chars) -> Medium Fonts
        // Long content (> 3500 chars) -> Standard Compact Fonts
        const isShort = totalChars < 2000;
        const isMedium = totalChars >= 2000 && totalChars < 3500;

        const baseText = isShort ? 'text-lg' : isMedium ? 'text-base' : 'text-sm';
        const headerText = isShort ? 'text-xl' : isMedium ? 'text-lg' : 'text-base';
        const nameText = isShort ? 'text-5xl' : isMedium ? 'text-4xl' : 'text-3xl';
        const spacingY = isShort ? 'space-y-6' : isMedium ? 'space-y-4' : 'space-y-3';
        const sectionMb = isShort ? 'mb-8' : isMedium ? 'mb-6' : 'mb-4';

        return (
            <div id={id} className={`bg-white text-black p-12 min-h-[11in] w-full font-serif leading-relaxed shadow-lg ${baseText}`}>
                {/* Header */}
                <div className={`text-center ${sectionMb}`}>
                    <h1 className={`${nameText} font-bold uppercase tracking-wide mb-4`}>{personalInfo.fullName}</h1>
                    <div className={`flex flex-wrap justify-center gap-x-6 ${isShort ? 'text-sm' : 'text-xs'} text-gray-700`}>
                        {personalInfo.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{personalInfo.linkedin}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div className="flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{personalInfo.github}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Education */}
                {education && education.length > 0 && (
                    <div className={sectionMb}>
                        <h2 className={`${headerText} font-bold uppercase border-b-2 border-black mb-4 pb-1`}>Education</h2>
                        <div className={spacingY}>
                            {education.map((edu) => (
                                <div key={edu.id} className="flex flex-col">
                                    <div className="flex justify-between font-bold">
                                        <span>{edu.institution}</span>
                                        <span>{edu.startDate} – {edu.endDate}</span>
                                    </div>
                                    <div className="flex justify-between italic text-gray-800">
                                        <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                                        <span>{edu.location || ''}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <div className={sectionMb}>
                        <h2 className={`${headerText} font-bold uppercase border-b-2 border-black mb-4 pb-1`}>Experience</h2>
                        <div className={spacingY}>
                            {experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between font-bold mb-1">
                                        <span className="text-lg">{exp.company}</span>
                                        <span>{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <div className="flex justify-between italic mb-2 text-gray-800">
                                        <span>{exp.position}</span>
                                        <span>{exp.location}</span>
                                    </div>
                                    <ul className={`list-disc list-outside ml-5 ${isShort ? 'space-y-2' : 'space-y-1'}`}>
                                        {exp.responsibilities.map((resp, idx) => (
                                            <li key={idx}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <div className={sectionMb}>
                        <h2 className={`${headerText} font-bold uppercase border-b-2 border-black mb-4 pb-1`}>Projects</h2>
                        <div className={spacingY}>
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between font-bold mb-1">
                                        <span>{proj.title}</span>
                                        <div className="italic font-normal text-gray-700">{proj.technologies.join(', ')}</div>
                                    </div>
                                    <ul className={`list-disc list-outside ml-5 mt-1 ${isShort ? 'space-y-2' : 'space-y-1'}`}>
                                        {proj.highlights.map((highlight, idx) => (
                                            <li key={idx}>{highlight}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <div className={sectionMb}>
                        <h2 className={`${headerText} font-bold uppercase border-b-2 border-black mb-4 pb-1`}>Technical Skills</h2>
                        <div className={`space-y-2 ${isShort ? 'text-base' : 'text-sm'}`}>
                            {skills.map((skillGroup, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <span className="font-bold min-w-[140px]">{skillGroup.category}:</span>
                                    <span>{skillGroup.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Template: Modern (Two-column, colorful) ---
    if (template === 'modern-resume') {
        return (
            <div id={id} className="bg-white text-gray-800 min-h-[11in] w-full flex shadow-lg overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-1/3 bg-slate-900 text-white p-6 flex flex-col gap-6">
                    <div className="text-center">
                        {/* Initials Avatar */}
                        {/* Initials Avatar or Photo */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/50 mx-auto mb-4 bg-slate-800 flex items-center justify-center shadow-lg">
                            {personalInfo.photoUrl ? (
                                <img
                                    src={personalInfo.photoUrl}
                                    alt={personalInfo.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-3xl font-bold">
                                    {personalInfo.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold leading-tight mb-2">{personalInfo.fullName}</h1>
                        <p className="text-blue-300 text-sm">{personalInfo.location}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="break-all">{personalInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>{personalInfo.phone}</span>
                        </div>
                        {personalInfo.linkedin && (
                            <div className="flex items-center gap-3">
                                <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="truncate">{personalInfo.linkedin}</span>
                            </div>
                        )}
                    </div>

                    {/* Skills in Sidebar */}
                    {skills && skills.length > 0 && (
                        <div>
                            <h3 className="text-blue-400 uppercase tracking-wider font-bold mb-3 text-sm border-b border-gray-700 pb-1">Skills</h3>
                            <div className="space-y-4">
                                {skills.map((grp, idx) => (
                                    <div key={idx}>
                                        <div className="font-semibold text-sm mb-1">{grp.category}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {grp.items.map((item, i) => (
                                                <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-300">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Content */}
                <div className="w-2/3 p-8 bg-white">

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Education
                            </h2>
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id} className="relative pl-4 border-l-2 border-slate-100">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                        <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                                        <div className="text-sm text-blue-600 font-medium mb-1">{edu.degree}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Experience
                            </h2>
                            <div className="space-y-5">
                                {experience.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                                            <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <div className="text-blue-700 font-medium text-sm mb-2">{exp.company} | {exp.location}</div>
                                        <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-gray-600">
                                            {exp.responsibilities.map((resp, idx) => (
                                                <li key={idx}>{resp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Projects
                            </h2>
                            <div className="space-y-4">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900">{proj.title}</h3>
                                            {proj.link && <a href={proj.link} className="text-blue-500 hover:underline"><ExternalLink className="w-4 h-4" /></a>}
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2 font-mono">{proj.technologies.join(' • ')}</div>
                                        <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-gray-600">
                                            {proj.highlights.map((h, i) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Default: Professional (Standard) ---
    return (
        <div id={id} className="bg-white text-gray-900 p-8 min-h-[11in] w-full font-sans shadow-lg">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-start gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {personalInfo.email}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>
                    </div>
                    {/* Socials */}
                    <div className="flex gap-4 mt-3 text-sm text-blue-700 font-medium">
                        {personalInfo.linkedin && <a href={personalInfo.linkedin} className="flex items-center gap-1 hover:underline"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                        {personalInfo.github && <a href={personalInfo.github} className="flex items-center gap-1 hover:underline"><Github className="w-4 h-4" /> GitHub</a>}
                        {personalInfo.website && <a href={personalInfo.website} className="flex items-center gap-1 hover:underline"><Globe className="w-4 h-4" /> Portfolio</a>}
                    </div>
                </div>

                {personalInfo.photoUrl && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img
                            src={personalInfo.photoUrl}
                            alt={personalInfo.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Experience */}
            <div className="mb-6">
                <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">Professional Experience</h2>
                <div className="space-y-5">
                    {experience.map((exp) => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                                <span className="text-sm font-semibold text-gray-600">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="text-gray-700 italic mb-2">{exp.company}, {exp.location}</div>
                            <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm leading-relaxed text-gray-700">
                                {exp.responsibilities.map((resp, idx) => (
                                    <li key={idx}><span dangerouslySetInnerHTML={{ __html: resp }} /></li> // Dangerous HTML for potential highlighting later
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className="mb-6">
                <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">Education</h2>
                <div className="space-y-3">
                    {education.map((edu) => (
                        <div key={edu.id}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                                <span className="text-sm text-gray-600">{edu.startDate} – {edu.endDate}</span>
                            </div>
                            <div>{edu.degree}, <span className="italic">{edu.field}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Projects */}
            <div className="mb-6">
                <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">Projects</h2>
                <div className="space-y-4">
                    {projects.map((proj) => (
                        <div key={proj.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-900">{proj.title}</h3>
                                {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline">{proj.link}</a>}
                            </div>
                            <p className="text-sm italic text-gray-600 mb-1">Tech: {proj.technologies.join(', ')}</p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-700">
                                {proj.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div>
                <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">Technical Skills</h2>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {skills.map((grp, idx) => (
                        <div key={idx} className="flex gap-2">
                            <span className="font-bold text-gray-800 w-24 shrink-0">{grp.category}:</span>
                            <span className="text-gray-700">{grp.items.join(', ')}</span>
                        </div>
                    ))}
                </div>
                {/* Custom Section */}
                {customSection && customSection.items && customSection.items.length > 0 && customSection.items[0] !== '' && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-800 uppercase border-b-2 border-gray-800 mb-2 mt-4">{customSection.title}</h2>
                        <ul className="list-disc list-outside ml-4 text-xs text-gray-700">
                            {customSection.items.map((item, i) => (
                                <li key={i} className="mb-1">{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
