

import React, { useState, useEffect } from 'react';
import { View, SubView } from '../App';
import { HomeIcon, LayoutDashboardIcon, TableIcon, BookOpenIcon, WandSparklesIcon, FolderKanbanIcon, LightbulbIcon, ClipboardCheckIcon, CalculatorIcon, BookmarkIcon, ChevronDoubleLeftIcon, UsersIcon } from './icons';

interface SideNavProps {
    isNavOpen: boolean;
    onToggleNav: () => void;
    activeView: View;
    onSetView: (view: View) => void;
    activeSqlView: SubView;
    onSetSqlView: (sqlView: SubView) => void;
    activeUnitsView: SubView;
    onSetUnitsView: (unitsView: SubView) => void;
    activeRubricsView: SubView;
    onSetRubricsView: (rubricsView: SubView) => void;
    activeSituationsView: SubView;
    onSetSituationsView: (situationsView: SubView) => void;
    activeActivitiesView: SubView;
    onSetActivitiesView: (activitiesView: SubView) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    isSubItem?: boolean;
    isNavOpen: boolean;
}> = ({ label, icon, isActive, onClick, isSubItem = false, isNavOpen }) => {
    return (
        <button
            onClick={onClick}
            title={!isNavOpen ? label : ''}
            className={`w-full flex items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${ isNavOpen ? (isSubItem ? 'pl-9 pr-3' : 'px-3') : 'px-3 justify-center'} ${
                isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
        >
            {icon}
            {isNavOpen && <span className="whitespace-nowrap">{label}</span>}
        </button>
    );
};

const CollapsibleMenu: React.FC<{
    label: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    isActive: boolean;
    children: React.ReactNode;
    isNavOpen: boolean;
}> = ({ label, icon, isOpen, onToggle, isActive, children, isNavOpen }) => (
    <div>
        <button
            onClick={onToggle}
            title={!isNavOpen ? label : ''}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
        >
            <span className="flex items-center gap-3">
                {icon}
                {isNavOpen && <span className="whitespace-nowrap">{label}</span>}
            </span>
            {isNavOpen && (
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
        {isNavOpen && isOpen && (
            <div className="mt-1 space-y-1">
                {children}
            </div>
        )}
    </div>
);

export const SideNav: React.FC<SideNavProps> = ({ 
    isNavOpen,
    onToggleNav,
    activeView, 
    onSetView,
    activeSqlView,
    onSetSqlView,
    activeUnitsView, 
    onSetUnitsView,
    activeRubricsView,
    onSetRubricsView,
    activeSituationsView,
    onSetSituationsView,
    activeActivitiesView,
    onSetActivitiesView,
}) => {
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    
    useEffect(() => {
        setOpenMenus(prev => ({
            ...prev,
            sql: activeView === 'sql',
            units: activeView === 'units',
            rubrics: activeView === 'rubrics',
            situations: activeView === 'situations',
            activities: activeView === 'activities',
        }));
    }, [activeView]);

    const handleToggle = (menu: string) => {
        if (!isNavOpen) {
            onToggleNav(); // Open the nav if it's closed and a menu is clicked
            setOpenMenus(prev => ({ ...prev, [menu]: true }));
        } else {
            setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
        }
    };
    
    const handleSubViewChange = (view: View, subView: SubView) => {
        onSetView(view);
        if (view === 'sql') onSetSqlView(subView);
        if (view === 'units') onSetUnitsView(subView);
        if (view === 'rubrics') onSetRubricsView(subView);
        if (view === 'situations') onSetSituationsView(subView);
        if (view === 'activities') onSetActivitiesView(subView);
    };

    return (
        <nav className={`bg-gray-950 border-r border-gray-800 p-3 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isNavOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-end mb-4 h-[36px]">
                <button onClick={onToggleNav} className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <ChevronDoubleLeftIcon className={`w-5 h-5 transition-transform duration-300 ${!isNavOpen && 'rotate-180'}`} />
                </button>
            </div>
            <div className="flex-grow space-y-1">
                <NavItem
                    isNavOpen={isNavOpen}
                    label="Inicio"
                    icon={<HomeIcon className="w-5 h-5" />}
                    isActive={activeView === 'dashboard'}
                    onClick={() => onSetView('dashboard')}
                />
                
                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Currículos"
                    icon={<LayoutDashboardIcon className="w-5 h-5" />}
                    isOpen={openMenus.sql}
                    onToggle={() => handleToggle('sql')}
                    isActive={activeView === 'sql'}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isActive={activeView === 'sql' && activeSqlView === 'generator'}
                        onClick={() => handleSubViewChange('sql', 'generator')}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isActive={activeView === 'sql' && activeSqlView === 'repository'}
                        onClick={() => handleSubViewChange('sql', 'repository')}
                        isSubItem
                    />
                </CollapsibleMenu>
                
                 <NavItem
                    isNavOpen={isNavOpen}
                    label="Alumnos"
                    icon={<UsersIcon className="w-5 h-5" />}
                    isActive={activeView === 'students'}
                    onClick={() => onSetView('students')}
                />

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Rúbricas"
                    icon={<TableIcon className="w-5 h-5" />}
                    isOpen={openMenus.rubrics}
                    onToggle={() => handleToggle('rubrics')}
                    isActive={activeView === 'rubrics'}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isActive={activeView === 'rubrics' && activeRubricsView === 'generator'}
                        onClick={() => handleSubViewChange('rubrics', 'generator')}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isActive={activeView === 'rubrics' && activeRubricsView === 'repository'}
                        onClick={() => handleSubViewChange('rubrics', 'repository')}
                        isSubItem
                    />
                </CollapsibleMenu>
                
                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Unidades Didácticas"
                    icon={<BookOpenIcon className="w-5 h-5" />}
                    isOpen={openMenus.units}
                    onToggle={() => handleToggle('units')}
                    isActive={activeView === 'units'}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isActive={activeView === 'units' && activeUnitsView === 'generator'}
                        onClick={() => handleSubViewChange('units', 'generator')}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isActive={activeView === 'units' && activeUnitsView === 'repository'}
                        onClick={() => handleSubViewChange('units', 'repository')}
                        isSubItem
                    />
                </CollapsibleMenu>

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="S. Aprendizaje"
                    icon={<LightbulbIcon className="w-5 h-5" />}
                    isOpen={openMenus.situations}
                    onToggle={() => handleToggle('situations')}
                    isActive={activeView === 'situations'}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isActive={activeView === 'situations' && activeSituationsView === 'generator'}
                        onClick={() => handleSubViewChange('situations', 'generator')}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isActive={activeView === 'situations' && activeSituationsView === 'repository'}
                        onClick={() => handleSubViewChange('situations', 'repository')}
                        isSubItem
                    />
                </CollapsibleMenu>

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Act. de Clase"
                    icon={<ClipboardCheckIcon className="w-5 h-5" />}
                    isOpen={openMenus.activities}
                    onToggle={() => handleToggle('activities')}
                    isActive={activeView === 'activities'}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isActive={activeView === 'activities' && activeActivitiesView === 'generator'}
                        onClick={() => handleSubViewChange('activities', 'generator')}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isActive={activeView === 'activities' && activeActivitiesView === 'repository'}
                        onClick={() => handleSubViewChange('activities', 'repository')}
                        isSubItem
                    />
                </CollapsibleMenu>
                
                <NavItem
                    isNavOpen={isNavOpen}
                    label="Recursos Educativos"
                    icon={<BookmarkIcon className="w-5 h-5" />}
                    isActive={activeView === 'resources'}
                    onClick={() => onSetView('resources')}
                />

                 <NavItem
                    isNavOpen={isNavOpen}
                    label="Utilidades"
                    icon={<CalculatorIcon className="w-5 h-5" />}
                    isActive={activeView === 'utilities'}
                    onClick={() => onSetView('utilities')}
                />

                <NavItem
                    isNavOpen={isNavOpen}
                    label="Mejoras"
                    icon={<WandSparklesIcon className="w-5 h-5" />}
                    isActive={activeView === 'improvements'}
                    onClick={() => onSetView('improvements')}
                />
            </div>
             <div className="flex-shrink-0 text-center text-xs text-gray-600">
                {isNavOpen && <p>&copy; {new Date().getFullYear()} CurrículoSQL</p>}
            </div>
        </nav>
    );
};