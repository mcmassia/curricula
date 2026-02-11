import React, { useRef } from 'react';
import { UploadIcon } from './icons';
import { Loader } from './Loader';

export type InputTab = 'paste' | 'pdf';

interface CurriculumInputProps {
    curriculumText: string;
    onCurriculumTextChange: (text: string) => void;
    onExtract: (file: File) => void;
    isExtracting: boolean;
    extractionError: string | null;
    subject: string;
    course: string;
    activeTab: InputTab;
    onTabChange: (tab: InputTab) => void;
}

export const CurriculumInput: React.FC<CurriculumInputProps> = ({ 
    curriculumText, 
    onCurriculumTextChange,
    onExtract,
    isExtracting,
    extractionError,
    subject,
    course,
    activeTab,
    onTabChange,
}) => {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleExtractClick = () => {
        if (selectedFile) {
            onExtract(selectedFile);
        }
    };
    
    const handleTabChange = (tab: InputTab) => {
        onTabChange(tab);
        if (tab !== 'pdf') {
            setSelectedFile(null);
        }
    }

    const TabButton: React.FC<{tabId: InputTab; label: string}> = ({tabId, label}) => (
        <button
            onClick={() => handleTabChange(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tabId 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:bg-gray-800/50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-gray-100">Paso 2: Proporcione el Currículo</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-2 flex space-x-2 border-b border-gray-700">
                    <TabButton tabId="paste" label="Pegar Texto" />
                    <TabButton tabId="pdf" label="Subir PDF" />
                </div>
                
                <div className="p-4 min-h-[300px] flex flex-col">
                    {activeTab === 'paste' && (
                        <div className="relative flex-grow h-80">
                            <textarea
                                value={curriculumText}
                                onChange={(e) => onCurriculumTextChange(e.target.value)}
                                placeholder="Pegue aquí el texto del currículo o extráigalo desde un PDF..."
                                className="w-full h-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 resize-y text-gray-300"
                                disabled={isExtracting}
                            />
                        </div>
                    )}
                    {activeTab === 'pdf' && (
                        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                            <UploadIcon className="w-12 h-12 text-gray-600" />
                            <input
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <p className="text-center text-sm text-gray-400 max-w-sm">
                                Rellene 'Materia' y 'Curso' en el Paso 1 para que el sistema pueda encontrar el currículo correcto dentro del PDF.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="font-semibold text-gray-300 hover:text-white underline transition-colors"
                                disabled={isExtracting}
                            >
                                {selectedFile ? "Cambiar archivo" : "Seleccionar archivo PDF"}
                            </button>
                            {selectedFile && <p className="text-gray-300 text-sm">{selectedFile.name}</p>}
                            <button 
                                onClick={handleExtractClick}
                                disabled={!selectedFile || isExtracting || !subject.trim() || !course.trim()}
                                className="w-full max-w-xs flex justify-center items-center gap-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {isExtracting ? (
                                    <>
                                        <Loader />
                                        Extrayendo...
                                    </>
                                ) : "Extraer Contenido"}
                            </button>
                        </div>
                    )}
                    {extractionError && <p className="text-red-400 text-sm mt-2 text-center">{extractionError}</p>}
                </div>
            </div>
        </div>
    );
};