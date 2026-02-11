import React, { useState } from 'react';
import { Rubric } from '../types';
import { DownloadIcon, MarkdownIcon, CheckIcon, DocumentTextIcon } from './icons';

interface RubricDisplayProps {
    rubric: Rubric;
    parentNames: Set<string>;
}

export const RubricDisplay: React.FC<RubricDisplayProps> = ({ rubric, parentNames }) => {
    const [isMarkdownCopied, setIsMarkdownCopied] = useState(false);
    const [isTextCopied, setIsTextCopied] = useState(false);

    const hasCriteria = rubric && rubric.criteria && rubric.criteria.length > 0;

    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(rubric, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = rubric.title.replace(/[\s,.\-']/g, '') || 'rubrica';
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = () => {
        const tableHtml = document.getElementById('rubric-print-area')?.innerHTML;
        if (!tableHtml) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${rubric.title}</title>
                    <style>
                        body { font-family: sans-serif; margin: 2rem; }
                        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ccc; padding: 0.75rem; text-align: left; vertical-align: top; }
                        thead { background-color: #f2f2f2; }
                        th { font-weight: bold; }
                        .parent-row { background-color: #e9e9e9; font-weight: bold; }
                        .no-criteria { padding: 2rem; text-align: center; color: #555; }
                    </style>
                </head>
                <body>
                    <h1>${rubric.title}</h1>
                    ${tableHtml}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };
    
    const handleCopyMarkdown = () => {
        if (!hasCriteria) return;

        let markdown = `## ${rubric.title}\n\n`;
        const headers = ["Criterio de Evaluación", ...(rubric.criteria[0].levels?.map(l => `${l.levelName} (${l.score})`) || [])];
        markdown += `| ${headers.join(" | ")} |\n`;
        markdown += `| ${headers.map(() => '---').join(" | ")} |\n`;
        
        rubric.criteria.forEach(criterion => {
            const isParent = parentNames.has(criterion.criterion);
            const criterionText = isParent ? `**${criterion.criterion}**` : criterion.criterion;
            const row = [criterionText, ...(criterion.levels?.map(l => l.description.replace(/\n/g, '<br>')) || [])];
            markdown += `| ${row.join(" | ")} |\n`;
        });
        
        navigator.clipboard.writeText(markdown).then(() => {
            setIsMarkdownCopied(true);
            setTimeout(() => setIsMarkdownCopied(false), 2000);
        });
    };

    const handleCopyText = () => {
        let text = `${rubric.title.toUpperCase()}\n\n`;
        text += "----------------------------------------\n\n";

        if (hasCriteria) {
            rubric.criteria.forEach(criterion => {
                const isParent = parentNames.has(criterion.criterion);
                text += `CRITERIO: ${isParent ? `**${criterion.criterion.toUpperCase()}**` : criterion.criterion}\n\n`;
                criterion.levels?.forEach(level => {
                    text += `  - ${level.levelName} (${level.score}):\n`;
                    text += `    ${level.description.replace(/\n/g, '\n    ')}\n`;
                });
                text += "\n----------------------------------------\n\n";
            });
        } else {
            text += "No se han definido criterios para esta rúbrica.\n";
        }
        
        navigator.clipboard.writeText(text).then(() => {
            setIsTextCopied(true);
            setTimeout(() => setIsTextCopied(false), 2000);
        });
    }

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">{rubric.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <button 
                        onClick={handleCopyText}
                        className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors"
                    >
                        {isTextCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <DocumentTextIcon className="w-4 h-4" />}
                        {isTextCopied ? "¡Copiado!" : "Copiar Texto"}
                    </button>
                    <button 
                        onClick={handleCopyMarkdown}
                        disabled={!hasCriteria}
                        className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isMarkdownCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <MarkdownIcon className="w-4 h-4" />}
                        {isMarkdownCopied ? "¡Copiado!" : "Copiar Markdown"}
                    </button>
                    <button 
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        PDF
                    </button>
                     <button 
                        onClick={handleDownloadJson}
                        className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        JSON
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <div id="rubric-print-area">
                    {!hasCriteria ? (
                        <div className="no-criteria p-8 text-center text-gray-400">
                            No se han definido criterios para esta rúbrica.
                        </div>
                    ) : (
                        <table className="w-full min-w-[800px] text-sm text-left text-gray-300 border-collapse">
                            <thead className="bg-gray-800 text-xs text-gray-300 uppercase">
                                <tr>
                                    <th scope="col" className="px-4 py-3 border border-gray-700 w-1/4">Criterio de Evaluación</th>
                                    {rubric.criteria[0].levels?.map(level => (
                                        <th key={level.levelName} scope="col" className="px-4 py-3 border border-gray-700">
                                            {level.levelName} ({level.score})
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rubric.criteria.map((criterion, index) => {
                                    const isParent = parentNames.has(criterion.criterion);
                                    return (
                                    <tr key={index} className={`${isParent ? 'bg-gray-800' : 'bg-gray-900'} hover:bg-gray-800/50`}>
                                        <td className={`px-4 py-3 border border-gray-700 align-top ${isParent ? 'font-bold text-white' : 'font-semibold'}`}>{criterion.criterion}</td>
                                        {criterion.levels?.map(level => (
                                            <td key={level.levelName} className="px-4 py-3 border border-gray-700 align-top">
                                                {level.description}
                                            </td>
                                        ))}
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};