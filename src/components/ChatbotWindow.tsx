import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { CloseIcon, BotIcon, SendIcon } from './icons';
import { Loader } from './Loader';
import { marked } from 'marked';

interface ChatbotWindowProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ messages, onSendMessage, onClose, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const parseMessage = (text: string) => {
        const html = marked.parse(text, { breaks: true });
        return { __html: html };
    };

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up">
            <header className="flex items-center justify-between p-3 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-md font-semibold text-gray-100 flex items-center gap-2">
                    <BotIcon className="w-5 h-5" /> Asistente IA
                </h3>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                     <div className="text-center text-sm text-gray-400 p-4">
                        <p>¡Hola! Soy tu asistente de CurrículoSQL. Pregúntame cómo usar la aplicación o pídemelo directamente.</p>
                        <p className="mt-2 text-xs text-gray-500">Ej: "muéstrame mis unidades de 1º ESO"</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`prose prose-invert prose-sm max-w-xs p-3 rounded-lg ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gray-800'}`}
                            dangerouslySetInnerHTML={parseMessage(msg.text)}
                        />
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-800 inline-flex items-center gap-2">
                           <Loader /> <span className="text-sm text-gray-400">Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-3 border-t border-gray-800 flex-shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full p-2 pr-10 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-400 hover:text-white disabled:text-gray-600">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
};
