import React, { useState, useEffect } from 'react';
import { CloseIcon, SaveIcon } from './icons';
import { SavedStudentGroup } from '../types';
import { HistoryItem } from '../services/historyService';

interface AssignCurriculaModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: SavedStudentGroup | null;
    allCurricula: HistoryItem[];
    onSave: (groupId: string, curriculumIds: string[]) => void;
}

export const AssignCurriculaModal: React.FC<AssignCurriculaModalProps> = ({ isOpen, onClose, group, allCurricula, onSave }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (group) {
            setSelectedIds(new Set(group.curriculumIds));
        }
    }, [group]);

    if (!isOpen || !group) return null;

    const handleToggle = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        onSave(group.id, Array.from(selectedIds));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Asignar Currículos a "{group.name}"</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    {allCurricula.length > 0 ? (
                        allCurricula.map(curriculum => (
                            <div key={curriculum.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-md">
                                <input
                                    type="checkbox"
                                    id={`curriculum-${curriculum.id}`}
                                    checked={selectedIds.has(curriculum.id)}
                                    onChange={() => handleToggle(curriculum.id)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                                />
                                <label htmlFor={`curriculum-${curriculum.id}`} className="flex-grow">
                                    <p className="font-semibold text-gray-200">{curriculum.subject}</p>
                                    <p className="text-sm text-gray-400">{curriculum.course} - {curriculum.region}</p>
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No hay currículos en el repositorio.</p>
                    )}
                </div>
                <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md">
                        <SaveIcon className="w-5 h-5" /> Guardar Asignaciones
                    </button>
                </div>
            </div>
        </div>
    );
};
