import { NextRequest, NextResponse } from 'next/server';
import { enhanceResumeWithAI } from '@/lib/ai-enhancer';
import { ResumeData } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, jobDescription } = body as {
            resumeData: ResumeData;
            jobDescription?: string;
        };

        if (!resumeData) {
            return NextResponse.json(
                { success: false, error: 'No resume data provided' },
                { status: 400 }
            );
        }

        // Enhance resume with AI
        const { enhanced, suggestions } = await enhanceResumeWithAI(
            resumeData,
            jobDescription
        );

        return NextResponse.json({
            success: true,
            enhanced,
            suggestions,
        });
    } catch (error) {
        console.error('Enhancement error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to enhance resume' },
            { status: 500 }
        );
    }
}
