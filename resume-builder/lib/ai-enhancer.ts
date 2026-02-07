import { openai } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, EnhancementSuggestion } from './types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

/**
 * Enhance resume content using OpenAI and Gemini APIs
 */

export async function enhanceResumeWithAI(
    resumeData: ResumeData,
    jobDescription?: string
): Promise<{ enhanced: ResumeData; suggestions: EnhancementSuggestion[] }> {
    const suggestions: EnhancementSuggestion[] = [];
    const enhanced: ResumeData = JSON.parse(JSON.stringify(resumeData)); // Deep clone

    try {
        // Enhance experience sections with OpenAI
        for (let i = 0; i < enhanced.experience.length; i++) {
            const exp = enhanced.experience[i];

            // Enhance responsibilities
            const enhancedResponsibilities = await enhanceWithOpenAI(
                exp.responsibilities,
                'responsibilities',
                jobDescription
            );

            enhancedResponsibilities.forEach((enhanced, idx) => {
                if (enhanced !== exp.responsibilities[idx]) {
                    suggestions.push({
                        id: `exp-resp-${i}-${idx}`,
                        section: `Experience - ${exp.position}`,
                        original: exp.responsibilities[idx],
                        enhanced,
                        reason: 'Improved clarity, added action verbs, and made more impactful',
                        accepted: false,
                    });
                }
            });

            enhanced.experience[i].responsibilities = enhancedResponsibilities;
        }

        // Enhance project descriptions with Gemini
        for (let i = 0; i < enhanced.projects.length; i++) {
            const proj = enhanced.projects[i];

            const enhancedDescription = await enhanceWithGemini(
                proj.description,
                'project description',
                jobDescription
            );

            if (enhancedDescription !== proj.description) {
                suggestions.push({
                    id: `proj-desc-${i}`,
                    section: `Project - ${proj.title}`,
                    original: proj.description,
                    enhanced: enhancedDescription,
                    reason: 'Optimized keywords and improved technical clarity',
                    accepted: false,
                });
                enhanced.projects[i].description = enhancedDescription;
            }

            // Enhance highlights
            const enhancedHighlights = await enhanceWithGemini(
                proj.highlights.join('\n'),
                'project highlights',
                jobDescription
            );

            const highlightsArray = enhancedHighlights.split('\n').filter(Boolean);
            if (highlightsArray.length > 0) {
                enhanced.projects[i].highlights = highlightsArray;
            }
        }

        return { enhanced, suggestions };
    } catch (error) {
        console.error('Error enhancing resume:', error);
        throw new Error('Failed to enhance resume content');
    }
}

async function enhanceWithOpenAI(
    content: string[],
    type: string,
    jobDescription?: string
): Promise<string[]> {
    try {
        const prompt = `You are an expert resume writer. Enhance the following ${type} to be more impactful, professional, and ATS-friendly.

${jobDescription ? `Target Job Description: ${jobDescription}\n\n` : ''}
Original ${type}:
${content.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Requirements:
- Start each point with a strong action verb
- Include quantifiable achievements where possible
- Keep it concise (1-2 lines per point)
- Use industry-standard terminology
- Make it ATS-friendly (avoid special characters)
${jobDescription ? '- Incorporate relevant keywords from the job description' : ''}

Return ONLY the enhanced points, one per line, without numbering.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert resume writer specializing in ATS optimization and impactful content creation.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const enhanced = data.choices[0].message.content.trim();

        return enhanced.split('\n').filter((line: string) => line.trim().length > 0);
    } catch (error) {
        console.error('OpenAI enhancement error:', error);
        return content; // Return original if enhancement fails
    }
}

export async function enhanceWithGemini(
    content: string,
    type: string,
    jobDescription?: string
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are an expert resume writer. Enhance the following ${type} to be more impactful and keyword-optimized.

${jobDescription ? `Target Job Description: ${jobDescription}\n\n` : ''}
Original ${type}:
${content}

Requirements:
- Improve clarity and professional tone
- Optimize for relevant keywords
- Keep it concise and impactful
- Make it ATS-friendly
${jobDescription ? '- Incorporate relevant keywords from the job description naturally' : ''}

Return ONLY the enhanced version, without any explanations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhanced = response.text().trim();

        return enhanced || content;
    } catch (error) {
        console.error('Gemini enhancement error:', error);
        return content; // Return original if enhancement fails
    }
}

export async function generateImprovementSuggestions(
    resumeData: ResumeData,
    atsScore: number
): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are an expert resume consultant. Analyze this resume and provide specific, actionable improvement suggestions.

Current ATS Score: ${atsScore}/100

Resume Summary:
- Experience entries: ${resumeData.experience.length}
- Projects: ${resumeData.projects.length}
- Skills: ${resumeData.skills.flatMap(s => s.items).length}
- Education: ${resumeData.education.length}

Provide 5-7 specific, actionable suggestions to improve this resume. Focus on:
1. Content improvements
2. Keyword optimization
3. Formatting enhancements
4. Missing sections or information
5. Ways to increase ATS score

Return suggestions as a numbered list.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse numbered list
        const suggestions = text
            .split('\n')
            .filter(line => /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());

        return suggestions;
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return [
            'Add more quantifiable achievements with specific numbers and percentages',
            'Include relevant technical keywords for your target role',
            'Ensure all experience entries start with strong action verbs',
            'Add links to your professional profiles (LinkedIn, GitHub)',
            'Include 2-3 relevant projects showcasing your skills',
        ];
    }
}
