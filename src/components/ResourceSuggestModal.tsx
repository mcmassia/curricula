import React from 'react';
import { SaberWithResources, SuggestedResource } from '../types';
import { CloseIcon, LinkIcon, LightbulbIcon, SaveIcon, CheckIcon } from './icons';
import { Loader } from './Loader';

interface ResourceSuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  data: SaberWithResources[] | null;
  onSave: (resource: SuggestedResource) => void;
  savedResourceUrls: Set<string>;
}

export const ResourceSuggestModal: React.FC<ResourceSuggestModalProps> = ({ isOpen, onClose, isLoading, error, data, onSave, savedResourceUrls }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader />
          <p className="mt-4 text-gray-400">Buscando recursos educativos en la web...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center text-red-300">
          <p className="font-semibold">Error al buscar recursos</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="p-8 text-center text-gray-400">
          <p>No se encontraron recursos para los saberes de este currículo.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index}>
            <h3 className="font-semibold text-gray-200 border-b-2 border-gray-700 pb-2 mb-3">
              {item.saber}
            </h3>
            <div className="space-y-4">
              {item.resources.map((res, resIndex) => {
                const isSaved = savedResourceUrls.has(res.url);
                return (
                    <div key={resIndex} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-grow">
                            <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 font-semibold text-gray-300 hover:text-white"
                            >
                                <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                {res.title}
                            </a>
                            <p className="mt-1 text-sm text-gray-400 pl-6">{res.description}</p>
                        </div>
                        <button
                            onClick={() => onSave(res)}
                            disabled={isSaved}
                            className={`flex-shrink-0 flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors ${
                                isSaved 
                                ? 'bg-green-800/50 text-green-300 cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            }`}
                        >
                            {isSaved ? <CheckIcon className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                            {isSaved ? 'Guardado' : 'Guardar'}
                        </button>
                    </div>
                )})}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-3">
            <LightbulbIcon className="w-6 h-6 text-yellow-300" />
            Recursos Educativos Sugeridos
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
        <div className="p-4 bg-gray-950/50 border-t border-gray-800 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};