import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancementTips } from '@/lib/enhancement-tips';
import { ResumeData, ATSScore } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, atsScore } = body as { resumeData: ResumeData; atsScore: ATSScore };

        if (!resumeData || !atsScore) {
            return NextResponse.json(
                { success: false, error: 'Missing resume data or ATS score' },
                { status: 400 }
            );
        }

        const tips = generateEnhancementTips(resumeData, atsScore);

        return NextResponse.json({
            success: true,
            tips,
        });
    } catch (error) {
        console.error('Enhancement tips error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate enhancement tips' },
            { status: 500 }
        );
    }
}
