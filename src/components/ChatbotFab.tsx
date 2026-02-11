import React from 'react';
import { MessageCircleIcon } from './icons';

interface ChatbotFabProps {
    onClick: () => void;
}

export const ChatbotFab: React.FC<ChatbotFabProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gray-700 hover:bg-gray-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform transform hover:scale-110"
            aria-label="Abrir asistente de IA"
        >
            <MessageCircleIcon className="w-7 h-7" />
        </button>
    );
};
