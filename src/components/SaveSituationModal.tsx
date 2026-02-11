
import React, { useState, useEffect } from 'react';
import { CloseIcon, SaveIcon } from './icons';

interface SaveSituationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subject: string, course: string, region: string) => void;
    initialData: { subject: string; course: string; region: string };
    situationTitle: string;
}

export const SaveSituationModal: React.FC<SaveSituationModalProps> = ({ isOpen, onClose, onSave, initialData, situationTitle }) => {
    const [subject, setSubject] = useState('');
    const [course, setCourse] = useState('');
    const [region, setRegion] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSubject(initialData.subject);
            setCourse(initialData.course);
            setRegion(initialData.region);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (subject.trim() && course.trim() && region.trim()) {
            onSave(subject, course, region);
        }
    };

    const canSave = subject.trim() && course.trim() && region.trim();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Guardar Situación de Aprendizaje</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">Complete los datos para asociar a esta situación de aprendizaje. Esta información es necesaria cuando se generan situaciones desde texto.</p>
                    <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                        <p className="font-semibold text-gray-200">{situationTitle}</p>
                    </div>
                    <div>
                        <label htmlFor="subject-save" className="block text-sm font-medium text-gray-400 mb-1">Materia</label>
                        <input type="text" id="subject-save" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Conocimiento del Medio..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                    </div>
                    <div>
                        <label htmlFor="course-save" className="block text-sm font-medium text-gray-400 mb-1">Curso</label>
                        <input type="text" id="course-save" value={course} onChange={e => setCourse(e.target.value)} placeholder="Ej: 1EP, 2ESO..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                    </div>
                    <div>
                        <label htmlFor="region-save" className="block text-sm font-medium text-gray-400 mb-1">Comunidad Autónoma</label>
                        <input type="text" id="region-save" value={region} onChange={e => setRegion(e.target.value)} placeholder="Ej: Castilla La Mancha..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={!canSave} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">
                        <SaveIcon className="w-5 h-5" />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
