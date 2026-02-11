
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { AppSidebar } from '../components/AppSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const MainLayout: React.FC = () => {
    const { user } = useAuth();
    // We don't really need addToast here, but it's available via useToast if needed by layout
    const [isNavOpen, setIsNavOpen] = useState(true);

    return (
        <div className="min-h-screen flex flex-col bg-gray-950">
            <Header user={user} />
            <div className="flex flex-grow h-0">
                <AppSidebar
                    isNavOpen={isNavOpen}
                    onToggleNav={() => setIsNavOpen(!isNavOpen)}
                />
                <main className={`flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
