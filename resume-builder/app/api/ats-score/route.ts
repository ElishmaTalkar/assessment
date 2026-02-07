import { NextRequest, NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-scorer';
import { ResumeData } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData, jobDescription } = body as { resumeData: ResumeData; jobDescription?: string };

        if (!resumeData) {
            return NextResponse.json(
                { success: false, error: 'No resume data provided' },
                { status: 400 }
            );
        }

        // Calculate ATS score
        const score = calculateATSScore(resumeData, jobDescription);

        return NextResponse.json({
            success: true,
            score,
        });
    } catch (error) {
        console.error('ATS scoring error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to calculate ATS score' },
            { status: 500 }
        );
    }
}
