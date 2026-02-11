
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
    HistoryItem, SavedDidacticUnit, RubricHistoryItem, SavedLearningSituation,
    SavedClassActivity, SavedEducationalResource, SavedStudent, SavedStudentGroup
} from '../types';
import { loadHistory } from '../services/historyService';
import { loadRubricsHistory } from '../services/rubricHistoryService';
import { loadDidacticUnits } from '../services/didacticUnitService';
import { loadLearningSituations } from '../services/learningSituationService';
import { loadClassActivities } from '../services/classActivityService';
import { loadEducationalResources } from '../services/educationalResourceService';
import { loadStudents } from '../services/studentService';
import { loadGroups } from '../services/groupService';

interface DataContextType {
    history: HistoryItem[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    rubricsHistory: RubricHistoryItem[];
    setRubricsHistory: React.Dispatch<React.SetStateAction<RubricHistoryItem[]>>;
    savedUnits: SavedDidacticUnit[];
    setSavedUnits: React.Dispatch<React.SetStateAction<SavedDidacticUnit[]>>;
    savedSituations: SavedLearningSituation[];
    setSavedSituations: React.Dispatch<React.SetStateAction<SavedLearningSituation[]>>;
    savedActivities: SavedClassActivity[];
    setSavedActivities: React.Dispatch<React.SetStateAction<SavedClassActivity[]>>;
    savedEducationalResources: SavedEducationalResource[];
    setSavedEducationalResources: React.Dispatch<React.SetStateAction<SavedEducationalResource[]>>;
    savedStudents: SavedStudent[];
    setSavedStudents: React.Dispatch<React.SetStateAction<SavedStudent[]>>;
    savedGroups: SavedStudentGroup[];
    setSavedGroups: React.Dispatch<React.SetStateAction<SavedStudentGroup[]>>;
    isLoadingData: boolean;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { addToast } = useToast();

    // Data State
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [rubricsHistory, setRubricsHistory] = useState<RubricHistoryItem[]>([]);
    const [savedUnits, setSavedUnits] = useState<SavedDidacticUnit[]>([]);
    const [savedSituations, setSavedSituations] = useState<SavedLearningSituation[]>([]);
    const [savedActivities, setSavedActivities] = useState<SavedClassActivity[]>([]);
    const [savedEducationalResources, setSavedEducationalResources] = useState<SavedEducationalResource[]>([]);
    const [savedStudents, setSavedStudents] = useState<SavedStudent[]>([]);
    const [savedGroups, setSavedGroups] = useState<SavedStudentGroup[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(false);

    const loadAllData = useCallback(async () => {
        if (!user) {
            // Reset data if no user
            setHistory([]);
            setRubricsHistory([]);
            setSavedUnits([]);
            setSavedSituations([]);
            setSavedActivities([]);
            setSavedEducationalResources([]);
            setSavedStudents([]);
            setSavedGroups([]);
            return;
        }

        setIsLoadingData(true);

        const loadAndSet = async <T,>(loader: (uid: string) => Promise<T>, setter: (data: T) => void, name: string) => {
            try {
                const data = await loader(user.uid);
                setter(data);
            } catch (error) {
                console.error(`Failed to load ${name} from Firestore:`, error);
                addToast(`Error al cargar ${name}.`, 'error', error);
            }
        };

        try {
            await Promise.all([
                loadAndSet(loadHistory, setHistory, 'currículos'),
                loadAndSet(loadRubricsHistory, setRubricsHistory, 'rúbricas'),
                loadAndSet(loadDidacticUnits, setSavedUnits, 'unidades didácticas'),
                loadAndSet(loadLearningSituations, setSavedSituations, 'situaciones de aprendizaje'),
                loadAndSet(loadClassActivities, setSavedActivities, 'actividades'),
                loadAndSet(loadEducationalResources, setSavedEducationalResources, 'recursos'),
                loadAndSet(loadStudents, setSavedStudents, 'alumnos'),
                loadAndSet(loadGroups, setSavedGroups, 'grupos de alumnos')
            ]);
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        if (!isAuthLoading) {
            loadAllData();
        }
    }, [isAuthLoading, loadAllData]);

    return (
        <DataContext.Provider value={{
            history, setHistory,
            rubricsHistory, setRubricsHistory,
            savedUnits, setSavedUnits,
            savedSituations, setSavedSituations,
            savedActivities, setSavedActivities,
            savedEducationalResources, setSavedEducationalResources,
            savedStudents, setSavedStudents,
            savedGroups, setSavedGroups,
            isLoadingData,
            refreshData: loadAllData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
