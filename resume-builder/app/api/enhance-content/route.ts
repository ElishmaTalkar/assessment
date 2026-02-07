import { NextRequest, NextResponse } from 'next/server';
import { enhanceWithGemini } from '@/lib/ai-enhancer';

// Force dynamic since we use environment variables and external APIs
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, type, jobDescription } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Content is required' },
                { status: 400 }
            );
        }

        // Use the existing library function
        // Note: enhanceWithGemini is not exported directly in the original file, 
        // but we can assume we might need to export it or create a wrapper. 
        // Wait, looking at the previous file view, enhanceWithGemini IS NOT exported.
        // It's a local function. I need to update lib/ai-enhancer.ts to export it first.

        // Let's assume I will fix the export in the next step.
        // For now, I'll write this file assuming the import works.

        const enhancedContent = await enhanceWithGemini(
            content,
            type || 'general content',
            jobDescription
        );

        return NextResponse.json({
            success: true,
            enhancedContent
        });

    } catch (error) {
        console.error('Enhancement error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to enhance content' },
            { status: 500 }
        );
    }
}
