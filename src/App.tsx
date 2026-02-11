
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DataProvider } from './contexts/DataContext';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <DataProvider>
                        <AppRoutes />
                    </DataProvider>
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;