import React, { useState, useMemo } from 'react';
import { CalculatorIcon, WandSparklesIcon } from './icons';
import { RubricHistoryItem, GradingResult, Rubric } from '../types';
import { Loader } from './Loader';

interface AssignmentGraderProps {
    rubrics: RubricHistoryItem[];
    onGradeAssignment: (file: File, rubricId: string) => void;
    isGrading: boolean;
    gradingResult: GradingResult | null;
    gradingError: string | null;
    onClear: () => void;
    onViewRubric: (rubric: Rubric) => void;
}

interface UtilitiesPanelProps {
    rubricsHistory: RubricHistoryItem[];
    onGradeAssignment: (file: File, rubricId: string) => void;
    isGrading: boolean;
    gradingResult: GradingResult | null;
    gradingError: string | null;
    onClearGrading: () => void;
    onViewRubric: (rubric: Rubric) => void;
}

const AssignmentGrader: React.FC<AssignmentGraderProps> = ({ onGradeAssignment, isGrading, gradingResult, gradingError, rubrics, onClear, onViewRubric }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedRubricId, setSelectedRubricId] = useState<string>(rubrics[0]?.id || '');
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleGrade = () => {
        if (selectedFile && selectedRubricId) {
            onGradeAssignment(selectedFile, selectedRubricId);
        }
    };

    const handleViewRubric = () => {
        if (!selectedRubricId) return;
        const selectedRubricItem = rubrics.find(r => r.id === selectedRubricId);
        if (selectedRubricItem) {
            onViewRubric(selectedRubricItem.rubric);
        }
    };

    if (gradingResult || gradingError) {
        return (
            <div>
                 <button onClick={onClear} className="text-sm text-gray-300 hover:text-white mb-4">&larr; Volver</button>
                {gradingError && <p className="text-red-400">{gradingError}</p>}
                {gradingResult && (
                    <div className="space-y-6">
                        <div>
                             <h3 className="text-lg font-semibold text-gray-200 mb-2">Resultados de la Evaluación</h3>
                            <div className="space-y-4">
                                {gradingResult.scores.map((score, index) => (
                                     <div key={index} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-gray-300 flex-1">{score.criterion}</p>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-gray-100">{score.suggestedLevel}</p>
                                                <p className="text-xs text-gray-400">{score.suggestedScore}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-400 border-t border-gray-700 pt-2">{score.justification}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-gray-200 mb-2">Feedback General para el Alumno</h3>
                             <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                <p className="text-gray-300 whitespace-pre-wrap">{gradingResult.overallFeedback}</p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="assignment-file" className="block text-sm font-medium text-gray-400 mb-1">1. Suba el trabajo del alumno</label>
                <input
                    type="file"
                    id="assignment-file"
                    accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                />
                {selectedFile && <p className="text-xs text-gray-500 mt-1">Archivo seleccionado: {selectedFile.name}</p>}
            </div>
            <div>
                <label htmlFor="rubric-select" className="block text-sm font-medium text-gray-400 mb-1">2. Seleccione la rúbrica de evaluación</label>
                <div className="flex items-center gap-2">
                    <select
                        id="rubric-select"
                        value={selectedRubricId}
                        onChange={(e) => setSelectedRubricId(e.target.value)}
                        disabled={rubrics.length === 0}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 flex-grow"
                    >
                        {rubrics.length > 0 ? (
                            rubrics.map(r => <option key={r.id} value={r.id}>{r.rubric.title} ({r.subject})</option>)
                        ) : (
                            <option>No hay rúbricas guardadas</option>
                        )}
                    </select>
                    <button
                        type="button"
                        onClick={handleViewRubric}
                        disabled={!selectedRubricId}
                        className="flex-shrink-0 text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Ver rúbrica seleccionada"
                    >
                        Ver Rúbrica
                    </button>
                </div>
            </div>
             <button
                onClick={handleGrade}
                disabled={isGrading || !selectedFile || !selectedRubricId}
                className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
            >
                {isGrading ? <><Loader /> Evaluando...</> : 'Evaluar con IA'}
            </button>
        </div>
    )
}

export const UtilitiesPanel: React.FC<UtilitiesPanelProps> = (props) => {
    const [maxScore, setMaxScore] = useState<number | ''>(100);
    const [studentScore, setStudentScore] = useState<number | ''>(85);
    const [maxGrade, setMaxGrade] = useState<number | ''>(10);

    const finalGrade = useMemo(() => {
        const ms = Number(maxScore);
        const ss = Number(studentScore);
        const mg = Number(maxGrade);

        if (ms > 0 && ss >= 0 && mg > 0) {
            const grade = (ss / ms) * mg;
            return grade.toFixed(2); // Return formatted to 2 decimal places
        }
        return 'N/A';
    }, [maxScore, studentScore, maxGrade]);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>) => 
        (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setter('');
        } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                setter(numValue);
            }
        }
    };
    
    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Utilidades</h1>
                <p className="mt-2 text-lg text-gray-400">Herramientas prácticas para facilitar sus tareas diarias.</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3 mb-4">
                        <CalculatorIcon className="w-6 h-6" />
                        Calculadora de Calificaciones
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="max-score" className="block text-sm font-medium text-gray-400 mb-1">Puntuación máxima de la prueba</label>
                            <input
                                type="number"
                                id="max-score"
                                value={maxScore}
                                onChange={handleInputChange(setMaxScore)}
                                placeholder="Ej: 100"
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="student-score" className="block text-sm font-medium text-gray-400 mb-1">Puntuación obtenida por el alumno</label>
                            <input
                                type="number"
                                id="student-score"
                                value={studentScore}
                                onChange={handleInputChange(setStudentScore)}
                                placeholder="Ej: 85"
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="max-grade" className="block text-sm font-medium text-gray-400 mb-1">Calificación máxima del sistema</label>
                            <input
                                type="number"
                                id="max-grade"
                                value={maxGrade}
                                onChange={handleInputChange(setMaxGrade)}
                                placeholder="Ej: 10"
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                            />
                        </div>
                    </div>

                    <div className="mt-6 p-6 bg-gray-950 border border-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-2">Calificación Final</p>
                        <p className="text-4xl font-bold text-gray-100">{finalGrade}</p>
                        <p className="text-xs text-gray-500 mt-3 font-mono">
                            Fórmula: ({studentScore || 0} / {maxScore || 1}) * {maxGrade || 0}
                        </p>
                    </div>
                </div>
                 <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3 mb-4">
                        <WandSparklesIcon className="w-6 h-6" />
                        Evaluar Trabajo con IA
                    </h2>
                    <AssignmentGrader 
                        rubrics={props.rubricsHistory}
                        onGradeAssignment={props.onGradeAssignment}
                        isGrading={props.isGrading}
                        gradingResult={props.gradingResult}
                        gradingError={props.gradingError}
                        onClear={props.onClearGrading}
                        onViewRubric={props.onViewRubric}
                    />
                </div>
            </div>
        </div>
    );
};