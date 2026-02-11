import React, { useState } from 'react';
import { HistoryItem } from '../services/historyService';
import { EvaluableItem } from '../services/sqlParser';
import { Rubric } from '../types';
import { Loader } from './Loader';
import { GraduationCapIcon, TableIcon, WandSparklesIcon } from './icons';
import { RubricDisplay } from './RubricDisplay';

type RubricInputTab = 'history' | 'text';

interface RubricsPanelProps {
    history: HistoryItem[];
    onSelectHistory: (item: HistoryItem) => void;
    selectedHistoryItem: HistoryItem | null;
    isParsingSql: boolean;
    isParsingText: boolean;
    onParseText: (text: string) => void;
    evaluableItems: EvaluableItem[];
    selectedItems: string[];
    onSelectedItemsChange: (items: string[]) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    generatedRubric: Rubric | null;
    error: string | null;
    subject: string;
    course: string;
    onReset: () => void;
    parentNames: Set<string>;
}

export const RubricsPanel: React.FC<RubricsPanelProps> = ({
    history,
    onSelectHistory,
    selectedHistoryItem,
    isParsingSql,
    isParsingText,
    onParseText,
    evaluableItems,
    selectedItems,
    onSelectedItemsChange,
    onGenerate,
    isGenerating,
    generatedRubric,
    error,
    subject,
    course,
    onReset,
    parentNames
}) => {
    const [activeTab, setActiveTab] = useState<RubricInputTab>('history');
    const [textInput, setTextInput] = useState('');

    const handleCheckboxChange = (tempId: string) => {
        const isChecked = selectedItems.includes(tempId);
        let newSelectedItems;

        if (isChecked) {
            newSelectedItems = selectedItems.filter(id => id !== tempId);
        } else {
            newSelectedItems = [...selectedItems, tempId];
        }
        onSelectedItemsChange(newSelectedItems);
    };
    
    const renderStep1_InputSelection = () => (
         <div className="space-y-4">
             <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                <GraduationCapIcon className="w-6 h-6" />
                Paso 1: Proporcione el contenido a evaluar
            </h2>
           
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-2 flex space-x-2 border-b border-gray-700">
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Historial</button>
                    <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'text' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Texto</button>
                </div>

                <div className="p-4">
                    {activeTab === 'history' && (
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                            {history.length > 0 ? history.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => onSelectHistory(item)}
                                    className={`w-full text-left p-3 rounded-lg border bg-gray-900 hover:border-gray-600 transition-colors ${selectedHistoryItem?.id === item.id ? 'border-gray-500' : 'border-gray-800'}`}
                                >
                                    <p className="font-semibold text-gray-100">{item.subject}</p>
                                    <p className="text-sm text-gray-400">{item.course} - {item.region}</p>
                                </button>
                            )) : <p className="text-gray-500 text-center p-4">No hay elementos en el historial. Genere un script SQL primero.</p>}
                        </div>
                    )}
                    {activeTab === 'text' && (
                        <div className="space-y-3">
                             <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Pegue aquí el texto del currículo con las competencias y criterios..."
                                className="w-full h-60 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 resize-y text-gray-300"
                                disabled={isParsingText}
                            />
                            <button
                                onClick={() => onParseText(textInput)}
                                disabled={isParsingText || !textInput.trim()}
                                className="w-full flex justify-center items-center gap-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {isParsingText ? <><Loader /> Analizando texto...</> : "Analizar Texto para Extraer Criterios"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep2_ItemSelection = () => (
        <div className="space-y-4">
             <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                <GraduationCapIcon className="w-6 h-6" />
                Paso 2: Seleccione los elementos a evaluar
            </h2>
            <div className="max-h-[500px] overflow-y-auto space-y-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                {evaluableItems.map(item => {
                    return (
                        <div key={item.parent.temp_id}>
                             <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md bg-gray-800/50">
                                <input 
                                    type="checkbox"
                                    id={`parent-${item.parent.temp_id}`}
                                    checked={selectedItems.includes(item.parent.temp_id)}
                                    onChange={() => handleCheckboxChange(item.parent.temp_id)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-gray-500 focus:ring-gray-600"
                                />
                                <label htmlFor={`parent-${item.parent.temp_id}`} className="font-semibold text-gray-200 flex-1">
                                    {item.parent.nombre}
                                </label>
                            </div>
                            <div className="space-y-2 pl-6 pt-2 border-l-2 border-gray-700 ml-2">
                                {item.children.map(child => (
                                    <div key={child.temp_id} className="flex items-center space-x-3 p-1">
                                        <input 
                                            type="checkbox"
                                            id={`child-${child.temp_id}`}
                                            checked={selectedItems.includes(child.temp_id)}
                                            onChange={() => handleCheckboxChange(child.temp_id)}
                                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-gray-500 focus:ring-gray-600"
                                        />
                                        <label htmlFor={`child-${child.temp_id}`} className="text-gray-300 flex-1">
                                            {child.nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={onGenerate}
                disabled={isGenerating || selectedItems.length === 0}
                className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
                title={(!subject.trim() || !course.trim()) ? "Consejo: Rellene Materia y Curso en la pestaña 'Generador' para un mejor guardado de la rúbrica." : ""}
            >
                {isGenerating ? <><Loader />Generando Rúbrica...</> : 'Generar Rúbrica'}
            </button>
        </div>
    );

    const renderStep3_Result = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                    <TableIcon className="w-6 h-6" />
                    Paso 3: Rúbrica Generada
                </h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 font-semibold py-2 px-3 rounded-md transition-colors"
                >
                    <WandSparklesIcon className="w-5 h-5" />
                    Generar Nueva Rúbrica
                </button>
            </div>
            {generatedRubric && <RubricDisplay rubric={generatedRubric} parentNames={parentNames} />}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Generador de Rúbricas de Evaluación</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Cree rúbricas detalladas a partir de currículos existentes.
                </p>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {(evaluableItems.length === 0 && !generatedRubric) && renderStep1_InputSelection()}
                
                {(isParsingSql || isParsingText) && <div className="flex justify-center"><Loader /></div>}

                {evaluableItems.length === 0 && !isParsingSql && !isParsingText && (selectedHistoryItem || activeTab === 'text') && (
                     <div className="text-center p-4 bg-gray-900 border border-gray-700 rounded-lg">
                        <p className="text-gray-400">No se encontraron elementos evaluables.</p>
                        <p className="text-sm text-gray-500 mt-1">Intente con otro elemento del historial o revise el texto proporcionado.</p>
                    </div>
                )}

                {evaluableItems.length > 0 && !generatedRubric && renderStep2_ItemSelection()}
                
                {generatedRubric && renderStep3_Result()}
                
                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>
        </div>
    );
};