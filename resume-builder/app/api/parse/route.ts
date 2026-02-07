import { NextRequest, NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/resume-parser';

// Force Node.js runtime for this route (required for pdf2json and mammoth)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file type
        const fileType = file.type;
        let text = '';

        if (fileType === 'application/pdf') {
            // Parse PDF using pdf2json (more server-friendly than pdf-parse)
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Use pdf2json for PDF parsing
            const PDFParser = require('pdf2json');
            const pdfParser = new PDFParser();

            // Parse PDF and extract text
            await new Promise((resolve, reject) => {
                pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                    // Extract text from all pages with better line break preservation
                    const pages = pdfData.Pages || [];
                    const allText: string[] = [];

                    pages.forEach((page: any) => {
                        const texts = page.Texts || [];

                        // Group texts by Y coordinate to preserve lines
                        const lineMap = new Map<number, string[]>();

                        texts.forEach((textItem: any) => {
                            if (textItem.R && textItem.R[0] && textItem.R[0].T) {
                                const y = textItem.y; // Y coordinate
                                let decodedText = '';

                                try {
                                    decodedText = decodeURIComponent(textItem.R[0].T);
                                } catch (e) {
                                    decodedText = textItem.R[0].T;
                                }

                                if (!lineMap.has(y)) {
                                    lineMap.set(y, []);
                                }
                                lineMap.get(y)!.push(decodedText);
                            }
                        });

                        // Sort by Y coordinate and join texts on same line
                        const sortedLines = Array.from(lineMap.entries())
                            .sort((a, b) => a[0] - b[0])
                            .map(([_, texts]) => texts.join(' '));

                        allText.push(...sortedLines);
                    });

                    text = allText.join('\n');
                    resolve(text);
                });

                pdfParser.on('pdfParser_dataError', (error: any) => {
                    reject(new Error('Failed to parse PDF: ' + error.parserError));
                });

                pdfParser.parseBuffer(buffer);
            });
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            // Parse DOCX using mammoth
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Use mammoth for DOCX parsing
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json(
                { success: false, error: 'Unsupported file type. Please upload PDF or DOCX.' },
                { status: 400 }
            );
        }

        // Parse the extracted text
        const resumeData = parseResumeText(text);

        return NextResponse.json({
            success: true,
            data: resumeData,
        });
    } catch (error) {
        console.error('Parse error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to parse resume. Please try a different file.' },
            { status: 500 }
        );
    }
}
