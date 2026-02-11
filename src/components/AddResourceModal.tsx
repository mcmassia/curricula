import React, { useState, useEffect } from 'react';
import { CloseIcon, SaveIcon } from './icons';
import { EducationalResource } from '../types';
import { HistoryItem } from '../services/historyService';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: EducationalResource) => void;
  history: HistoryItem[];
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose, onSave, history }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [curriculumId, setCurriculumId] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setName('');
      setDescription('');
      setUrl('');
      setCurriculumId(history.length > 0 ? history[0].id : '');
    }
  }, [isOpen, history]);

  if (!isOpen) return null;

  const handleSave = () => {
    const curriculum = history.find(h => h.id === curriculumId);
    if (name.trim() && url.trim() && curriculumId && curriculum) {
      onSave({
        name,
        description,
        url,
        curriculumId,
        curriculumSubject: curriculum.subject
      });
    }
  };
  
  const canSave = name.trim() && url.trim() && curriculumId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">Añadir Nuevo Recurso Educativo</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="res-curriculum" className="block text-sm font-medium text-gray-400 mb-1">Asociar al Currículo</label>
            <select 
                id="res-curriculum"
                value={curriculumId} 
                onChange={(e) => setCurriculumId(e.target.value)} 
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
            >
                {history.map(item => <option key={item.id} value={item.id}>{item.subject} - {item.course}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="res-name" className="block text-sm font-medium text-gray-400 mb-1">Nombre del Recurso</label>
            <input type="text" id="res-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Simulación de Ecosistemas" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
          </div>
          <div>
            <label htmlFor="res-url" className="block text-sm font-medium text-gray-400 mb-1">Enlace (URL)</label>
            <input type="url" id="res-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
          </div>
          <div>
            <label htmlFor="res-desc" className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
            <textarea id="res-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Breve descripción del recurso..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 resize-y" />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={!canSave} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">
            <SaveIcon className="w-5 h-5" />
            Guardar Recurso
          </button>
        </div>
      </div>
    </div>
  );
};