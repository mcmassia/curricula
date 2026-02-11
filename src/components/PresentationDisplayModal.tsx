import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import { CloseIcon, ClipboardIcon, CheckIcon, DownloadIcon } from './icons';
import { Loader } from './Loader';

interface PresentationDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  presentationData: Slide[] | null;
}

export const PresentationDisplayModal: React.FC<PresentationDisplayModalProps> = ({ isOpen, onClose, isLoading, presentationData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setIsCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (presentationData && currentSlide < presentationData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleCopyContent = () => {
    if (!presentationData) return;
    const textToCopy = presentationData.map((slide, index) => {
        const content = slide.content.map(point => `- ${point}`).join('\n');
        return `Diapositiva ${index + 1}: ${slide.title}\n${content}\n\n`;
    }).join('');

    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownloadJson = () => {
    if (!presentationData) return;
    const jsonString = JSON.stringify(presentationData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentacion.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-full">
          <Loader />
          <p className="mt-4 text-gray-400">Generando presentación...</p>
        </div>
      );
    }

    if (!presentationData || presentationData.length === 0) {
      return (
        <div className="p-8 text-center text-gray-400">
          <p>No se pudo generar la presentación.</p>
        </div>
      );
    }
    
    const slide = presentationData[currentSlide];

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Slide View */}
            <div className="w-full md:w-2/3 bg-gray-900 p-8 flex flex-col justify-center items-center">
                <div className="w-full h-full bg-gray-800 rounded-lg p-6 flex flex-col border border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-100 mb-4">{slide.title}</h2>
                    <ul className="space-y-3 text-lg text-gray-300 list-disc list-inside">
                        {slide.content.map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                </div>
                 {/* Navigation */}
                <div className="flex items-center justify-between w-full mt-4">
                    <button onClick={handlePrev} disabled={currentSlide === 0} className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50">Anterior</button>
                    <span className="text-sm text-gray-400">{currentSlide + 1} / {presentationData.length}</span>
                    <button onClick={handleNext} disabled={currentSlide === presentationData.length - 1} className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50">Siguiente</button>
                </div>
            </div>

            {/* Speaker Notes */}
            <div className="w-full md:w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Notas del Orador</h3>
                <div className="flex-grow bg-gray-800/50 rounded-lg p-4 text-gray-400 text-sm overflow-y-auto">
                    <p className="whitespace-pre-wrap">{slide.speakerNotes}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Visor de Presentación</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyContent} disabled={!presentationData} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-1.5 px-3 rounded-md transition-colors">
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                {isCopied ? 'Copiado' : 'Copiar Contenido'}
            </button>
             <button onClick={handleDownloadJson} disabled={!presentationData} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-1.5 px-3 rounded-md transition-colors">
                <DownloadIcon className="w-4 h-4" /> Descargar JSON
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};