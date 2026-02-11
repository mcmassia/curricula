import { jsPDF } from 'jspdf';
import { marked } from 'marked';

/**
 * Converts a Markdown string to a styled HTML string, ready for PDF generation.
 * @param markdown The markdown content.
 * @returns An HTML string.
 */
const markdownToHtml = (markdown: string): string => {
    const rawHtml = marked.parse(markdown);

    const styles = `
        <style>
            body { 
                font-family: Helvetica, Arial, sans-serif; 
                font-size: 12pt; 
                line-height: 1.6;
                color: #333;
            }
            h1 { font-size: 22pt; color: #111; border-bottom: 2px solid #ccc; padding-bottom: 8px; margin-bottom: 24px; }
            h2 { font-size: 18pt; color: #222; margin-top: 28px; margin-bottom: 14px; }
            h3 { font-size: 14pt; color: #333; margin-top: 22px; margin-bottom: 10px; font-weight: bold; }
            p { margin-bottom: 14px; }
            ul, ol { padding-left: 24px; margin-bottom: 14px; }
            li { margin-bottom: 8px; }
            code { 
                font-family: 'Courier New', Courier, monospace; 
                background-color: #f4f4f4; 
                padding: 2px 4px; 
                border-radius: 4px;
                font-size: 11pt;
            }
            strong { font-weight: bold; }
        </style>
    `;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            ${styles}
        </head>
        <body>
            ${rawHtml}
        </body>
        </html>
    `;
};

/**
 * Generates a PDF from a Markdown string and triggers a download.
 * @param markdown The markdown content for the PDF.
 * @param fileName The desired name for the downloaded PDF file.
 */
export const generatePdfFromMarkdown = async (markdown: string, fileName: string): Promise<void> => {
    const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
    });
    
    const html = markdownToHtml(markdown);

    await doc.html(html, {
        callback: function (doc) {
            doc.save(`${fileName}.pdf`);
        },
        x: 40,
        y: 40,
        width: 515, // A4 width (595pt) - margins (40pt * 2)
        windowWidth: 700, // virtual window width
        autoPaging: 'text',
    });
};