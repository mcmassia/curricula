import React, { useMemo, useState, useEffect } from 'react';
import { View, SubView } from '../App';
import { BookOpenIcon, LayoutDashboardIcon, TableIcon, LightbulbIcon, ClipboardCheckIcon, CalculatorIcon, BookmarkIcon, HistoryIcon, UsersIcon, SearchIcon, PencilIcon, TrashIcon } from './icons';
import { HistoryItem } from '../services/historyService';
import { SavedDidacticUnit, RubricHistoryItem, SavedLearningSituation, SavedClassActivity, SavedEducationalResource, RecentItem, RecentItemType, SavedStudent, SavedStudentGroup, SearchResult, SearchResultType } from '../types';

interface WelcomePanelProps {
    onNavigate: (view: View, subView?: SubView) => void;
    onGlobalSearchSelect: (result: SearchResult) => void;
    history: HistoryItem[];
    savedUnits: SavedDidacticUnit[];
    savedSituations: SavedLearningSituation[];
    savedActivities: SavedClassActivity[];
    savedEducationalResources: SavedEducationalResource[];
    rubricsHistory: RubricHistoryItem[];
    savedStudents: SavedStudent[];
    savedGroups: SavedStudentGroup[];
    onUpdateGroup: (groupId: string, updates: Partial<SavedStudentGroup>) => void;
    onDeleteGroup: (groupId: string) => void;
    onOpenAssignCurricula: (group: SavedStudentGroup) => void;
}

const StatCard: React.FC<{ label: string, value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
        <div className="flex justify-center items-center h-8 mb-2">
            {icon}
        </div>
        <p className="text-3xl font-bold text-gray-100">{value}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{label}</p>
    </div>
);


export const WelcomePanel: React.FC<WelcomePanelProps> = ({ 
    onNavigate, onGlobalSearchSelect, history, savedUnits, savedSituations, savedActivities, 
    savedEducationalResources, rubricsHistory, savedStudents, savedGroups,
    onUpdateGroup, onDeleteGroup, onOpenAssignCurricula
}) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerSearch = searchTerm.toLowerCase();
        const results: SearchResult[] = [];

        history.forEach(item => {
            if (item.subject.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: item.subject, type: 'curriculum', view: 'sql', subView: 'repository' });
            }
        });
        savedStudents.forEach(item => {
            const fullName = `${item.firstName} ${item.lastName}`;
            if (fullName.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: fullName, type: 'student', view: 'students', subView: 'repository' });
            }
        });
        savedUnits.forEach(item => {
            if (item.unit.title.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: item.unit.title, type: 'unit', view: 'units', subView: 'repository' });
            }
        });
        savedSituations.forEach(item => {
            if (item.situation.title.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: item.situation.title, type: 'situation', view: 'situations', subView: 'repository' });
            }
        });
        savedActivities.forEach(item => {
            if (item.activity.title.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: item.activity.title, type: 'activity', view: 'activities', subView: 'repository' });
            }
        });
        rubricsHistory.forEach(item => {
            if (item.rubric.title.toLowerCase().includes(lowerSearch)) {
                results.push({ id: item.id, title: item.rubric.title, type: 'rubric', view: 'rubrics', subView: 'repository' });
            }
        });

        setSearchResults(results.slice(0, 10)); // Limit results
    }, [searchTerm, history, savedStudents, savedUnits, savedSituations, savedActivities, rubricsHistory]);

    const handleSearchResultClick = (result: SearchResult) => {
        onGlobalSearchSelect(result);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleStartEditGroup = (group: SavedStudentGroup) => {
        setEditingGroupId(group.id);
        setEditingGroupName(group.name);
    };

    const handleSaveGroupName = () => {
        if (editingGroupId && editingGroupName.trim()) {
            onUpdateGroup(editingGroupId, { name: editingGroupName });
        }
        setEditingGroupId(null);
        setEditingGroupName('');
    };
    
    const stats = [
        { label: 'Currículos', value: history.length, icon: <LayoutDashboardIcon className="w-6 h-6 text-gray-400" /> },
        { label: 'Alumnos', value: savedStudents.length, icon: <UsersIcon className="w-6 h-6 text-gray-400" /> },
        { label: 'Unidades', value: savedUnits.length, icon: <BookOpenIcon className="w-6 h-6 text-gray-400" /> },
        { label: 'S. Aprendizaje', value: savedSituations.length, icon: <LightbulbIcon className="w-6 h-6 text-gray-400" /> },
        { label: 'Actividades', value: savedActivities.length, icon: <ClipboardCheckIcon className="w-6 h-6 text-gray-400" /> },
        { label: 'Rúbricas', value: rubricsHistory.length, icon: <TableIcon className="w-6 h-6 text-gray-400" /> },
    ];

    const recentItems: RecentItem[] = useMemo(() => {
        const allItems: RecentItem[] = [
            ...history.map((item): RecentItem => ({ id: item.id, type: 'curriculum', title: item.subject, subTitle: `${item.course} - ${item.region}`, date: new Date(item.createdAt), view: 'sql', subView: 'repository' })),
            ...savedStudents.map((item): RecentItem => ({ id: item.id, type: 'student', title: `${item.firstName} ${item.lastName}`, subTitle: `Alumno`, date: new Date(item.createdAt), view: 'students' })),
            ...savedGroups.map((item): RecentItem => ({ id: item.id, type: 'group', title: item.name, subTitle: `Grupo de ${item.studentIds.length} alumnos`, date: new Date(item.createdAt), view: 'students' })),
            ...savedUnits.map((item): RecentItem => ({ id: item.id, type: 'unit', title: item.unit.title, subTitle: `${item.subject} - ${item.course}`, date: new Date(item.createdAt), view: 'units', subView: 'repository' })),
            ...savedSituations.map((item): RecentItem => ({ id: item.id, type: 'situation', title: item.situation.title, subTitle: `${item.subject} - ${item.course}`, date: new Date(item.createdAt), view: 'situations', subView: 'repository' })),
            ...savedActivities.map((item): RecentItem => ({ id: item.id, type: 'activity', title: item.activity.title, subTitle: `${item.subject} - ${item.course}`, date: new Date(item.createdAt), view: 'activities', subView: 'repository' })),
            ...savedEducationalResources.map((item): RecentItem => ({ id: item.id, type: 'resource', title: item.name, subTitle: item.curriculumSubject, date: new Date(item.createdAt), view: 'resources' })),
        ];

        return allItems.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    }, [history, savedUnits, savedSituations, savedActivities, savedEducationalResources, savedStudents, savedGroups]);

    
    const aiSuggestion: { text: string; buttonLabel: string; action: () => void; } | null = useMemo(() => {
        if (history.length > 0 && savedStudents.length === 0) {
            return {
                text: 'Ya tienes currículos. ¡Ahora puedes empezar a añadir a tus alumnos!',
                buttonLabel: 'Añadir Alumnos',
                action: () => onNavigate('students')
            };
        }

        const sortedUnits = [...savedUnits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (sortedUnits.length > 0 && Object.keys(sortedUnits[0].detailedActivities || {}).length === 0) {
            return {
                text: `¿Por qué no creas actividades para tu última unidad: "${sortedUnits[0].unit.title}"?`,
                buttonLabel: 'Ir a la Unidad',
                action: () => onNavigate('units', 'repository')
            };
        }
        
        return {
            text: 'Empieza por transformar tu primer currículo educativo en una base de datos.',
            buttonLabel: 'Crear Currículo',
            action: () => onNavigate('sql', 'generator')
        };

    }, [savedUnits, history, savedStudents, onNavigate]);

     const iconMap: { [key in RecentItemType | SearchResultType]: React.ReactNode } = {
        curriculum: <LayoutDashboardIcon className="w-5 h-5 text-gray-400" />,
        unit: <BookOpenIcon className="w-5 h-5 text-gray-400" />,
        situation: <LightbulbIcon className="w-5 h-5 text-gray-400" />,
        activity: <ClipboardCheckIcon className="w-5 h-5 text-gray-400" />,
        resource: <BookmarkIcon className="w-5 h-5 text-gray-400" />,
        student: <UsersIcon className="w-5 h-5 text-gray-400" />,
        group: <UsersIcon className="w-5 h-5 text-gray-400" />,
        rubric: <TableIcon className="w-5 h-5 text-gray-400" />,
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-100">Bienvenido a CurrículoSQL</h1>
                <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                    Su suite de herramientas inteligentes para el diseño y la gestión curricular.
                </p>
            </div>
             
             {/* Global Search */}
            <div className="max-w-3xl mx-auto mb-12 relative">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Búsqueda global: alumnos, currículos, unidades, rúbricas..."
                        className="w-full p-4 pl-12 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                </div>
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                        {searchResults.map(result => (
                            <button key={`${result.type}-${result.id}`} onClick={() => handleSearchResultClick(result)} className="w-full text-left p-3 hover:bg-gray-800 flex items-center gap-3">
                                {iconMap[result.type]}
                                <span className="flex-1 min-w-0">
                                    <span className="font-semibold text-gray-200 truncate block">{result.title}</span>
                                    <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" /> Grupos de Clase
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {savedGroups.map(group => (
                            <div key={group.id} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center group">
                                {editingGroupId === group.id ? (
                                    <div className="flex items-center gap-2 flex-grow">
                                        <input type="text" value={editingGroupName} onChange={e => setEditingGroupName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveGroupName()}/>
                                        <button onClick={handleSaveGroupName} className="text-green-400">✓</button>
                                        <button onClick={() => setEditingGroupId(null)} className="text-red-400">×</button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="font-semibold text-gray-200">{group.name}</p>
                                            <p className="text-xs text-gray-400">{group.studentIds.length} Alumno(s) &bull; {group.curriculumIds.length} Currículo(s)</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onOpenAssignCurricula(group)} title="Asignar Currículos" className="p-1.5 hover:bg-gray-700 rounded-md"><BookOpenIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleStartEditGroup(group)} title="Renombrar" className="p-1.5 hover:bg-gray-700 rounded-md"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onDeleteGroup(group.id)} title="Eliminar" className="p-1.5 hover:bg-gray-700 rounded-md"><TrashIcon className="w-4 h-4 text-red-400" /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                         {savedGroups.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No hay grupos creados.</p>
                                <button onClick={() => onNavigate('students')} className="text-sm font-semibold text-gray-300 hover:text-white mt-2">Ir a la sección de Alumnos para empezar</button>
                            </div>
                         )}
                    </div>
                </div>
                
                <div className="space-y-8">
                     <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                            <HistoryIcon className="w-5 h-5" /> Añadido Recientemente
                        </h3>
                        <div className="space-y-3">
                            {recentItems.length > 0 ? recentItems.map(item => (
                                <button key={`${item.type}-${item.id}`} onClick={() => onNavigate(item.view, item.subView)} className="w-full text-left p-3 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{iconMap[item.type]}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-200 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400 truncate">{item.subTitle}</p>
                                        </div>
                                    </div>
                                </button>
                            )) : <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente.</p>}
                        </div>
                    </div>
                    {aiSuggestion && (
                         <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                                <LightbulbIcon className="w-5 h-5 text-yellow-300" /> Sugerencia IA
                            </h3>
                            <div className="flex-grow flex flex-col justify-center text-center bg-gray-800/50 p-4 rounded-md">
                                <p className="text-sm text-gray-300">{aiSuggestion.text}</p>
                                <button onClick={aiSuggestion.action} className="mt-4 w-full bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-200 font-bold py-2 px-4 rounded-md transition-colors text-sm">
                                    {aiSuggestion.buttonLabel}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
            </div>
        </div>
    );
};