import React from 'react';
import { WarningIcon } from './icons';

interface SqlValidationDisplayProps {
  errors: string[];
}

export const SqlValidationDisplay: React.FC<SqlValidationDisplayProps> = ({ errors }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 text-sm text-yellow-200">
      <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
        <WarningIcon className="w-5 h-5 text-yellow-400" />
        Se encontraron problemas de validación
      </h3>
      <p className="mb-3 text-yellow-300">
        El script puede tener errores que impidan su importación. Por favor, revise los siguientes puntos:
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};