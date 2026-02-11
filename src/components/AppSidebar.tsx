
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, LayoutDashboardIcon, TableIcon, BookOpenIcon, WandSparklesIcon, FolderKanbanIcon, LightbulbIcon, ClipboardCheckIcon, CalculatorIcon, BookmarkIcon, ChevronDoubleLeftIcon, UsersIcon } from './icons';

interface AppSidebarProps {
    isNavOpen: boolean;
    onToggleNav: () => void;
}

const NavItem: React.FC<{
    to: string;
    label: string;
    icon: React.ReactNode;
    isSubItem?: boolean;
    isNavOpen: boolean;
    end?: boolean;
}> = ({ to, label, icon, isSubItem = false, isNavOpen, end = false }) => {
    return (
        <NavLink
            to={to}
            end={end}
            title={!isNavOpen ? label : ''}
            className={({ isActive }) => `w-full flex items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${isNavOpen ? (isSubItem ? 'pl-9 pr-3' : 'px-3') : 'px-3 justify-center'} ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
        >
            {icon}
            {isNavOpen && <span className="whitespace-nowrap">{label}</span>}
        </NavLink>
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
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
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

export const AppSidebar: React.FC<AppSidebarProps> = ({ isNavOpen, onToggleNav }) => {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    // Automatically open menus based on current path
    useEffect(() => {
        setOpenMenus(prev => ({
            ...prev,
            sql: location.pathname.startsWith('/sql'),
            units: location.pathname.startsWith('/units'),
            rubrics: location.pathname.startsWith('/rubrics'),
            situations: location.pathname.startsWith('/situations'),
            activities: location.pathname.startsWith('/activities'),
        }));
    }, [location.pathname]);

    const handleToggle = (menu: string) => {
        if (!isNavOpen) {
            onToggleNav();
            setOpenMenus(prev => ({ ...prev, [menu]: true }));
        } else {
            setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
        }
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
                    to="/"
                    label="Inicio"
                    icon={<HomeIcon className="w-5 h-5" />}
                    end
                />

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Currículos"
                    icon={<LayoutDashboardIcon className="w-5 h-5" />}
                    isOpen={openMenus.sql}
                    onToggle={() => handleToggle('sql')}
                    isActive={location.pathname.startsWith('/sql')}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/sql/generator"
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/sql/repository"
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isSubItem
                    />
                </CollapsibleMenu>

                <NavItem
                    isNavOpen={isNavOpen}
                    to="/students"
                    label="Alumnos"
                    icon={<UsersIcon className="w-5 h-5" />}
                />

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Rúbricas"
                    icon={<TableIcon className="w-5 h-5" />}
                    isOpen={openMenus.rubrics}
                    onToggle={() => handleToggle('rubrics')}
                    isActive={location.pathname.startsWith('/rubrics')}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/rubrics/generator"
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/rubrics/repository"
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isSubItem
                    />
                </CollapsibleMenu>

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Unidades Didácticas"
                    icon={<BookOpenIcon className="w-5 h-5" />}
                    isOpen={openMenus.units}
                    onToggle={() => handleToggle('units')}
                    isActive={location.pathname.startsWith('/units')}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/units/generator"
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/units/repository"
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isSubItem
                    />
                </CollapsibleMenu>

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="S. Aprendizaje"
                    icon={<LightbulbIcon className="w-5 h-5" />}
                    isOpen={openMenus.situations}
                    onToggle={() => handleToggle('situations')}
                    isActive={location.pathname.startsWith('/situations')}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/situations/generator"
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/situations/repository"
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isSubItem
                    />
                </CollapsibleMenu>

                <CollapsibleMenu
                    isNavOpen={isNavOpen}
                    label="Act. de Clase"
                    icon={<ClipboardCheckIcon className="w-5 h-5" />}
                    isOpen={openMenus.activities}
                    onToggle={() => handleToggle('activities')}
                    isActive={location.pathname.startsWith('/activities')}
                >
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/activities/generator"
                        label="Generador"
                        icon={<WandSparklesIcon className="w-5 h-5" />}
                        isSubItem
                    />
                    <NavItem
                        isNavOpen={isNavOpen}
                        to="/activities/repository"
                        label="Repositorio"
                        icon={<FolderKanbanIcon className="w-5 h-5" />}
                        isSubItem
                    />
                </CollapsibleMenu>

                <NavItem
                    isNavOpen={isNavOpen}
                    to="/resources"
                    label="Recursos Educativos"
                    icon={<BookmarkIcon className="w-5 h-5" />}
                />

                <NavItem
                    isNavOpen={isNavOpen}
                    to="/utilities"
                    label="Utilidades"
                    icon={<CalculatorIcon className="w-5 h-5" />}
                />

                <NavItem
                    isNavOpen={isNavOpen}
                    to="/improvements"
                    label="Mejoras"
                    icon={<WandSparklesIcon className="w-5 h-5" />}
                />
            </div>
            <div className="flex-shrink-0 text-center text-xs text-gray-600">
                {isNavOpen && <p>&copy; {new Date().getFullYear()} CurrículoSQL</p>}
            </div>
        </nav>
    );
};
