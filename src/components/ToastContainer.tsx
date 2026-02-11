
import React from 'react';
import { Toast } from './Toast';
import { Toast as ToastType, FirebaseErrorDetails } from '../types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: number) => void;
  onShowDetails: (details: FirebaseErrorDetails) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, onShowDetails }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove} 
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  );
};
