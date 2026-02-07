import { NextRequest, NextResponse } from 'next/server';
import { enhanceResumeWithAI } from '@/lib/ai-enhancer';
import { ResumeData } from '@/lib/types';

// Force dynamic since we use environment variables and external APIs
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, jobDescription } = body as { resumeData: ResumeData; jobDescription?: string };

        if (!resumeData) {
            return NextResponse.json(
                { success: false, error: 'Resume data is required' },
                { status: 400 }
            );
        }

        // Call the library function to enhance the entire resume
        const { enhanced, suggestions } = await enhanceResumeWithAI(resumeData, jobDescription);

        return NextResponse.json({
            success: true,
            enhancedResume: enhanced,
            suggestions
        });

    } catch (error) {
        console.error('Full resume enhancement error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to enhance resume' },
            { status: 500 }
        );
    }
}
