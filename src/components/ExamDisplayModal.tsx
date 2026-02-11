import React, { useState } from 'react';
import { CloseIcon, ClipboardIcon, CheckIcon, SaveIcon } from './icons';
import { Loader } from './Loader';
import { ExamData, Rubric } from '../types';

interface ExamDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  examContent: ExamData | null;
  onSave: () => void;
}

const RubricTable: React.FC<{ rubric: Rubric }> = ({ rubric }) => (
    <div className="overflow-x-auto mt-2">
        <table className="w-full min-w-[600px] text-sm text-left text-gray-300 border-collapse">
            <thead className="bg-gray-800 text-xs text-gray-300 uppercase">
                <tr>
                    <th scope="col" className="px-4 py-3 border border-gray-700 w-1/4">{rubric.title}</th>
                    {rubric.criteria[0]?.levels?.map(level => (
                        <th key={level.levelName} scope="col" className="px-4 py-3 border border-gray-700">
                            {level.levelName} ({level.score})
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rubric.criteria.map((criterion, index) => (
                    <tr key={index} className="bg-gray-900 hover:bg-gray-800/50">
                        <td className="px-4 py-3 border border-gray-700 align-top font-semibold">{criterion.criterion}</td>
                        {criterion.levels?.map(level => (
                            <td key={level.levelName} className="px-4 py-3 border border-gray-700 align-top">
                                {level.description}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const ExamDisplayModal: React.FC<ExamDisplayModalProps> = ({ isOpen, onClose, isLoading, examContent, onSave }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const content = document.getElementById('exam-content-to-copy');
    if (content) {
      const html = content.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      // The ClipboardItem interface is a modern and robust way to copy rich text.
      const data = [new ClipboardItem({ 'text/html': blob })];
      
      navigator.clipboard.write(data).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error("Failed to copy rich text: ", err);
        // Fallback for older browsers
        const plainText = content.innerText;
        navigator.clipboard.writeText(plainText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
      });
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-full">
          <Loader />
          <p className="mt-4 text-gray-400">Generando prueba de evaluación...</p>
        </div>
      );
    }

    if (!examContent) {
      return (
        <div className="p-8 text-center text-gray-400">
          <p>No se pudo generar la prueba.</p>
        </div>
      );
    }

    return (
        <div id="exam-content-to-copy" className="prose prose-invert prose-sm sm:prose-base max-w-none p-6 space-y-6">
            <h1>{examContent.title}</h1>
            <p className="text-gray-400">{examContent.instructions}</p>
            
            <section>
                <h2>1. Preguntas de Opción Múltiple</h2>
                <ol className="space-y-4">
                    {examContent.multipleChoiceQuestions.map((q, i) => (
                        <li key={i}>
                            <p className="font-semibold">{q.question}</p>
                            <ul className="list-none p-0 mt-2 space-y-1">
                                {q.options.map((opt, j) => (
                                    <li key={j}>{String.fromCharCode(97 + j)}) {opt}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ol>
            </section>
            
            <section>
                <h2>2. Preguntas de Desarrollo Corto</h2>
                 <ol className="space-y-4">
                    {examContent.shortAnswerQuestions.map((q, i) => (
                        <li key={i}><p className="font-semibold">{q.question}</p></li>
                    ))}
                </ol>
            </section>
            
            <section>
                <h2>3. Supuesto Práctico</h2>
                <p>{examContent.practicalCase.question}</p>
            </section>

             <details className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <summary className="font-bold text-lg text-gray-200 cursor-pointer">Guía de Corrección</summary>
                <div className="mt-4 space-y-4">
                    <section>
                        <h3>Respuestas de Opción Múltiple</h3>
                        <ol>
                        {examContent.correctionGuide.multipleChoiceAnswers.map((a, i) =>(
                            <li key={i}><strong>{a.question}:</strong> {a.answer}</li>
                        ))}
                        </ol>
                    </section>
                     <section>
                        <h3>Pautas para Preguntas de Desarrollo</h3>
                        <ol>
                        {examContent.correctionGuide.shortAnswerGuidelines.map((g, i) =>(
                            <li key={i}>{g}</li>
                        ))}
                        </ol>
                    </section>
                    <section>
                        <h3>Pautas para Supuesto Práctico</h3>
                        <p>{examContent.correctionGuide.practicalCaseGuidelines}</p>
                    </section>
                </div>
            </details>

            <details className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <summary className="font-bold text-lg text-gray-200 cursor-pointer">Rúbrica de Calificación</summary>
                <div className="mt-4 not-prose">
                    <RubricTable rubric={examContent.gradingRubric} />
                </div>
            </details>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Prueba de Evaluación Generada</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
        <div className="flex justify-end gap-3 p-4 bg-gray-950/50 border-t border-gray-800 rounded-b-lg">
          <button onClick={handleCopy} disabled={!examContent} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
            {isCopied ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={onSave} disabled={!examContent} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">
            <SaveIcon className="w-5 h-5" /> Guardar en Actividades
          </button>
        </div>
      </div>
    </div>
  );
};