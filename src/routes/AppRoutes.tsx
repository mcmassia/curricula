
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../components/Login';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';

// Pages
import { DashboardPage } from '../pages/DashboardPage';
import { CurriculumGeneratorPage } from '../pages/curriculum/CurriculumGeneratorPage';
import { CurriculumRepositoryPage } from '../pages/curriculum/CurriculumRepositoryPage';
import { RubricsGeneratorPage } from '../pages/rubrics/RubricsGeneratorPage';
import { RubricsRepositoryPage } from '../pages/rubrics/RubricsRepositoryPage';
import { DidacticUnitsGeneratorPage } from '../pages/units/DidacticUnitsGeneratorPage';
import { DidacticUnitsRepositoryPage } from '../pages/units/DidacticUnitsRepositoryPage';
import { DidacticUnitEditorPage } from '../pages/units/DidacticUnitEditorPage';
import { LearningSituationsGeneratorPage } from '../pages/situations/LearningSituationsGeneratorPage';
import { LearningSituationsRepositoryPage } from '../pages/situations/LearningSituationsRepositoryPage';
import { LearningSituationEditorPage } from '../pages/situations/LearningSituationEditorPage';
import { ClassActivitiesGeneratorPage } from '../pages/activities/ClassActivitiesGeneratorPage';
import { ClassActivitiesRepositoryPage } from '../pages/activities/ClassActivitiesRepositoryPage';
import { ClassActivityEditorPage } from '../pages/activities/ClassActivityEditorPage';
import { StudentsPage } from '../pages/students/StudentsPage';
import { EducationalResourcesPage } from '../pages/resources/EducationalResourcesPage';
import { UtilitiesPage } from '../pages/utilities/UtilitiesPage';
import { ImprovementsPage } from '../pages/improvements/ImprovementsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-400"><Loader /> Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route index element={<DashboardPage />} />

                {/* Curriculum Routes */}
                <Route path="sql">
                    <Route path="generator" element={<CurriculumGeneratorPage />} />
                    <Route path="repository" element={<CurriculumRepositoryPage />} />
                    <Route index element={<Navigate to="repository" replace />} />
                </Route>

                {/* Rubrics Routes */}
                <Route path="rubrics">
                    <Route path="generator" element={<RubricsGeneratorPage />} />
                    <Route path="repository" element={<RubricsRepositoryPage />} />
                    <Route index element={<Navigate to="repository" replace />} />
                </Route>

                {/* Didactic Units Routes */}
                <Route path="units">
                    <Route path="generator" element={<DidacticUnitsGeneratorPage />} />
                    <Route path="repository" element={<DidacticUnitsRepositoryPage />} />
                    <Route path="editor/:id" element={<DidacticUnitEditorPage />} />
                    <Route path="editor" element={<DidacticUnitEditorPage />} /> {/* New Unit */}
                    <Route index element={<Navigate to="repository" replace />} />
                </Route>

                {/* Learning Situations Routes */}
                <Route path="situations">
                    <Route path="generator" element={<LearningSituationsGeneratorPage />} />
                    <Route path="repository" element={<LearningSituationsRepositoryPage />} />
                    <Route path="editor/:id" element={<LearningSituationEditorPage />} />
                    <Route path="editor" element={<LearningSituationEditorPage />} />
                    <Route index element={<Navigate to="repository" replace />} />
                </Route>

                {/* Class Activities Routes */}
                <Route path="activities">
                    <Route path="generator" element={<ClassActivitiesGeneratorPage />} />
                    <Route path="repository" element={<ClassActivitiesRepositoryPage />} />
                    <Route path="editor/:id" element={<ClassActivityEditorPage />} />
                    <Route path="editor" element={<ClassActivityEditorPage />} />
                    <Route index element={<Navigate to="repository" replace />} />
                </Route>

                <Route path="students" element={<StudentsPage />} />
                <Route path="resources" element={<EducationalResourcesPage />} />
                <Route path="utilities" element={<UtilitiesPage />} />
                <Route path="improvements" element={<ImprovementsPage />} />

                {/* Catch all - Redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};
