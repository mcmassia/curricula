import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon, DownloadIcon } from './icons';
import { ProgressBar } from './ProgressBar';

interface SqlDisplayProps {
  sqlCode: string;
  isLoading: boolean;
  fileName: string;
  progress: number;
}

export const SqlDisplay: React.FC<SqlDisplayProps> = ({ sqlCode, isLoading, fileName, progress }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (sqlCode) {
      navigator.clipboard.writeText(sqlCode);
      setIsCopied(true);
    }
  };

  const handleDownload = () => {
    if (sqlCode) {
      const blob = new Blob([sqlCode], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    if (isLoading && !sqlCode) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
           <div className="w-full max-w-sm">
             <ProgressBar progress={progress} />
           </div>
          <p className="mt-4 text-gray-400">Generando script... El texto aparecerá a continuación.</p>
        </div>
      );
    }

    if (!sqlCode && !isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">El script SQL aparecerá aquí.</p>
        </div>
      );
    }
    
    return (
      <pre className="text-sm overflow-auto h-full p-4">
        <code className="language-sql text-gray-300 whitespace-pre-wrap">{sqlCode}</code>
      </pre>
    );
  };
  
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 border border-gray-700 rounded-lg flex flex-col">
       <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
         {sqlCode && !isLoading && (
            <>
                <button
                  onClick={handleDownload}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-md transition-colors duration-200"
                  aria-label="Download SQL script"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-md transition-colors duration-200"
                  aria-label="Copy SQL to clipboard"
                >
                  {isCopied ? (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5" />
                  )}
                </button>
            </>
         )}
       </div>
      <div className="flex-grow h-0 pt-12 overflow-hidden">
         {renderContent()}
      </div>
    </div>
  );
};