
// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, FirebaseErrorDetails } from '../types';
import { getFirebaseErrorDetails } from '../services/firebaseErrorHelper';
import { ToastContainer } from '../components/ToastContainer';
import { FirebaseErrorModal } from '../components/FirebaseErrorModal';

interface ToastContextType {
    addToast: (message: string, type: 'success' | 'error' | 'info', error?: unknown, url?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [firebaseErrorDetails, setFirebaseErrorDetails] = useState<FirebaseErrorDetails | null>(null);
    const [isFirebaseErrorModalOpen, setIsFirebaseErrorModalOpen] = useState(false);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info', error?: unknown, url?: string) => {
        const id = Date.now() + Math.random();
        const details = error ? getFirebaseErrorDetails(error) : undefined;
        setToasts(prev => [...prev, { id, message, type, details, url }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    const handleCloseToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleShowFirebaseErrorDetails = (details: FirebaseErrorDetails) => {
        setFirebaseErrorDetails(details);
        setIsFirebaseErrorModalOpen(true);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer
                toasts={toasts}
                onClose={handleCloseToast}
                onShowDetails={handleShowFirebaseErrorDetails}
            />
            {isFirebaseErrorModalOpen && firebaseErrorDetails && (
                <FirebaseErrorModal
                    isOpen={isFirebaseErrorModalOpen}
                    onClose={() => setIsFirebaseErrorModalOpen(false)}
                    details={firebaseErrorDetails}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
