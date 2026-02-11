import React, { useState } from 'react';
import { CloseIcon, UploadIcon } from './icons';
import { Student } from '../types';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Student[]) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleImport = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                setError("El archivo está vacío o no se puede leer.");
                return;
            }
            
            const buffer = event.target.result as ArrayBuffer;

            // Attempt to decode as UTF-8 first.
            let decoder = new TextDecoder('utf-8');
            let text = decoder.decode(buffer);

            // The replacement character � (U+FFFD) is a strong indicator of a decoding mismatch.
            // If it's present, we fall back to a legacy encoding common in Spanish systems.
            if (text.includes('�')) {
                decoder = new TextDecoder('iso-8859-1'); // Also known as latin1
                text = decoder.decode(buffer);
            }

            const students: Student[] = [];
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const header = lines[0]?.split(';').map(h => h.replace(/"/g, '').trim()) || [];
            
            // Map headers to expected indices
            const nameIndex = header.indexOf('Nombre completo');
            const idIndex = header.indexOf('ID');
            const tagsIndex = header.indexOf('Etiquetas');
            const ageIndex = header.indexOf('Edad');
            const phoneIndex = header.indexOf('Teléfono');
            const addressIndex = header.indexOf('Dirección');
            const cityIndex = header.indexOf('Población');


            // Start from line 1 to skip header
            for (let i = 1; i < lines.length; i++) {
                const fields = lines[i].split(';').map(field => field.replace(/"/g, '').trim());
                
                if (nameIndex === -1 || !fields[nameIndex]) {
                    continue; // Skip if no name column or name is empty
                }
                
                const fullName = fields[nameIndex];
                const nameParts = fullName.split(',');

                if (nameParts.length === 2) {
                    const lastName = nameParts[0].trim();
                    const firstName = nameParts[1].trim();

                    if (firstName && lastName) {
                         const student: Student = { 
                             firstName, 
                             lastName,
                             tags: fields[tagsIndex] || undefined,
                             idNumber: fields[idIndex] || undefined,
                             age: fields[ageIndex] || undefined,
                             phone: fields[phoneIndex] || undefined,
                             address: [fields[addressIndex], fields[cityIndex]].filter(Boolean).join(', ') || undefined,
                        };
                        students.push(student);
                    }
                }
            }
            
            if (students.length === 0) {
                 setError("No se encontraron alumnos válidos. Asegúrese de que el archivo es un CSV delimitado por ; y contiene la columna 'Nombre completo' con el formato 'Apellidos, Nombre'.");
                 return;
            }

            onImport(students);
        };
        reader.onerror = () => {
            setError("Error al leer el archivo.");
        };
        // Read file as ArrayBuffer to handle decoding manually and robustly
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Importar Alumnos desde CSV</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">
                        Seleccione un archivo CSV exportado desde plataformas educativas como Qualitas Educativa. 
                        El sistema está optimizado para archivos delimitados por punto y coma (;) donde la tercera columna contiene el nombre completo en formato:
                        <code className="block bg-gray-800 p-2 rounded-md mt-2 text-xs font-mono">
                            "Apellidos, Nombre"
                        </code>
                    </p>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600" />
                    {file && <p className="text-xs text-gray-500">Seleccionado: {file.name}</p>}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                    <button onClick={handleImport} disabled={!file} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 text-gray-900 font-bold py-2 px-4 rounded-md">
                        <UploadIcon className="w-5 h-5" /> Importar
                    </button>
                </div>
            </div>
        </div>
    );
};