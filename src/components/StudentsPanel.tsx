import React, { useState, useMemo, useEffect } from 'react';
import { SavedStudent, SavedStudentGroup, Student } from '../types';
import { HistoryItem } from '../services/historyService';
import { UsersIcon, TrashIcon, PencilIcon, UserPlusIcon, UploadIcon, BookOpenIcon } from './icons';

interface StudentsPanelProps {
    students: SavedStudent[];
    groups: SavedStudentGroup[];
    onSaveStudent: (student: Student) => void;
    onDeleteStudent: (studentIds: string[]) => void;
    onImportStudents: () => void;
    onSaveGroup: (name: string) => void;
    onUpdateGroup: (groupId: string, updates: Partial<SavedStudentGroup>) => void;
    onDeleteGroup: (groupId: string) => void;
    onAssignCurricula: (group: SavedStudentGroup) => void;
    onViewStudent: (student: SavedStudent) => void;
    initialFilter?: string;
}

export const StudentsPanel: React.FC<StudentsPanelProps> = ({
    students, groups, onSaveStudent, onDeleteStudent, onImportStudents, onSaveGroup, onUpdateGroup, onDeleteGroup, onAssignCurricula, onViewStudent, initialFilter
}) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>('all'); // 'all', 'unassigned', or a group ID
    const [newStudent, setNewStudent] = useState<Student>({ firstName: '', lastName: '', email: '' });
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');
    const [groupSearch, setGroupSearch] = useState('');
    const [studentSearch, setStudentSearch] = useState(initialFilter || '');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [bulkAssignGroupId, setBulkAssignGroupId] = useState<string>('');
    
    useEffect(() => {
        if (initialFilter) {
            setStudentSearch(initialFilter);
        }
    }, [initialFilter]);

    const studentsInGroups = useMemo(() => new Set(groups.flatMap(g => g.studentIds)), [groups]);

    const filteredGroups = useMemo(() => {
        if (!groupSearch.trim()) return groups;
        return groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
    }, [groups, groupSearch]);

    const visibleStudents = useMemo(() => {
        let baseList: SavedStudent[];
        if (selectedGroupId === 'all') {
            baseList = students;
        } else if (selectedGroupId === 'unassigned') {
            baseList = students.filter(s => !studentsInGroups.has(s.id));
        } else {
            const group = groups.find(g => g.id === selectedGroupId);
            baseList = group ? students.filter(s => group.studentIds.includes(s.id)) : [];
        }

        if (!studentSearch.trim()) return baseList;
        const lowerSearch = studentSearch.toLowerCase();
        return baseList.filter(s => 
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(lowerSearch) ||
            s.email?.toLowerCase().includes(lowerSearch)
        );
    }, [students, groups, selectedGroupId, studentsInGroups, studentSearch]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(new Set(visibleStudents.map(s => s.id)));
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };
    
    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newStudent.firstName.trim() && newStudent.lastName.trim()) {
            onSaveStudent(newStudent);
            setNewStudent({ firstName: '', lastName: '', email: '' });
        }
    };

    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            onSaveGroup(newGroupName);
            setNewGroupName('');
        }
    };
    
    const handleStartEditGroup = (group: SavedStudentGroup) => {
        setEditingGroupId(group.id);
        setEditingGroupName(group.name);
    };

    const handleSaveGroupName = () => {
        if (editingGroupId && editingGroupName.trim()) {
            onUpdateGroup(editingGroupId, { name: editingGroupName });
            setEditingGroupId(null);
            setEditingGroupName('');
        }
    };
    
    const handleRemoveStudentFromGroup = (studentId: string, groupId: string) => {
         const group = groups.find(g => g.id === groupId);
         if(group) {
             const updatedStudentIds = group.studentIds.filter(id => id !== studentId);
             onUpdateGroup(group.id, { studentIds: updatedStudentIds });
         }
    };
    
    const handleBulkAssign = () => {
        if (!bulkAssignGroupId || selectedStudentIds.size === 0) return;
        const group = groups.find(g => g.id === bulkAssignGroupId);
        if (group) {
            const updatedStudentIds = [...new Set([...group.studentIds, ...selectedStudentIds])];
            onUpdateGroup(group.id, { studentIds: updatedStudentIds });
            setSelectedStudentIds(new Set());
        }
    };

    const handleBulkDelete = () => {
        if (selectedStudentIds.size === 0) return;
        onDeleteStudent(Array.from(selectedStudentIds));
        setSelectedStudentIds(new Set());
    };

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-h-[calc(100vh-8rem)]">
            {/* Left Column: Group Management */}
            <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2">Grupos</h2>
                <input type="text" value={groupSearch} onChange={e => setGroupSearch(e.target.value)} placeholder="Filtrar grupos..." className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                    <button onClick={() => setSelectedGroupId('all')} className={`w-full text-left p-3 rounded-md transition-colors ${selectedGroupId === 'all' ? 'bg-gray-700' : 'hover:bg-gray-800/50'}`}>Todos los Alumnos ({students.length})</button>
                    <button onClick={() => setSelectedGroupId('unassigned')} className={`w-full text-left p-3 rounded-md transition-colors ${selectedGroupId === 'unassigned' ? 'bg-gray-700' : 'hover:bg-gray-800/50'}`}>Sin Asignar ({students.length - studentsInGroups.size})</button>
                    <hr className="border-gray-700 my-2" />
                    {filteredGroups.map(group => (
                        <div key={group.id} className={`p-3 rounded-md group transition-colors ${selectedGroupId === group.id ? 'bg-gray-700' : 'hover:bg-gray-800/50'}`}>
                            {editingGroupId === group.id ? (
                                <div className="flex items-center gap-2">
                                    <input type="text" value={editingGroupName} onChange={e => setEditingGroupName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveGroupName()}/>
                                    <button onClick={handleSaveGroupName} className="text-green-400">✓</button>
                                    <button onClick={() => setEditingGroupId(null)} className="text-red-400">×</button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center" onClick={() => setSelectedGroupId(group.id)}>
                                    <span className="flex-grow cursor-pointer">{group.name} ({group.studentIds.length})</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); onAssignCurricula(group) }} title="Asignar Currículos" className="p-1 hover:bg-gray-700 rounded"><BookOpenIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleStartEditGroup(group) }} title="Renombrar" className="p-1 hover:bg-gray-700 rounded"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id) }} title="Eliminar" className="p-1 hover:bg-gray-700 rounded"><TrashIcon className="w-4 h-4 text-red-400" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddGroup} className="mt-4 flex gap-2">
                    <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nuevo grupo..." className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                    <button type="submit" className="bg-gray-700 p-2 rounded-md hover:bg-gray-600">+</button>
                </form>
            </div>

            {/* Right Column: Student Management */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-2">
                     <h2 className="text-xl font-semibold">Alumnos ({visibleStudents.length})</h2>
                     <button onClick={onImportStudents} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors">
                        <UploadIcon className="w-4 h-4"/> Importar CSV
                    </button>
                 </div>
                 <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Filtrar alumnos..." className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                 
                {selectedStudentIds.size > 0 && (
                    <div className="bg-gray-800 p-2 rounded-md mb-4 flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-300">{selectedStudentIds.size} seleccionado(s)</span>
                        <div className="flex items-center gap-2">
                            <select onChange={e => setBulkAssignGroupId(e.target.value)} value={bulkAssignGroupId} className="bg-gray-700 text-xs p-1 rounded">
                                <option value="">Asignar a...</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <button onClick={handleBulkAssign} disabled={!bulkAssignGroupId} className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500 disabled:opacity-50">Asignar</button>
                             <button onClick={handleBulkDelete} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded hover:bg-red-900/80">Eliminar Seleccionados</button>
                        </div>
                    </div>
                )}
                 
                 <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                     <div className="flex items-center space-x-3 p-2 border-b border-gray-700">
                         <input type="checkbox" onChange={handleSelectAll} checked={visibleStudents.length > 0 && selectedStudentIds.size === visibleStudents.length} className="h-4 w-4 rounded bg-gray-700 border-gray-600"/>
                         <label className="text-sm font-semibold">Seleccionar Todos</label>
                     </div>
                     {visibleStudents.map(student => (
                         <div key={student.id} className="p-3 bg-gray-800/50 rounded-md flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <input type="checkbox" checked={selectedStudentIds.has(student.id)} onChange={() => handleSelectStudent(student.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600" />
                                <button onClick={() => onViewStudent(student)} className="text-left">
                                    <p className="font-semibold">{student.lastName}, {student.firstName}</p>
                                    <p className="text-xs text-gray-400">{student.email}</p>
                                </button>
                             </div>
                             <div className="flex items-center gap-2">
                                {selectedGroupId && selectedGroupId !== 'all' && selectedGroupId !== 'unassigned' && (
                                    <button onClick={() => handleRemoveStudentFromGroup(student.id, selectedGroupId)} title="Quitar del grupo" className="p-1 text-red-400 hover:bg-red-900/50 rounded"><TrashIcon className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => onDeleteStudent([student.id])} title="Eliminar alumno" className="p-1 text-red-400 hover:bg-red-900/50 rounded"><TrashIcon className="w-4 h-4" /></button>
                             </div>
                         </div>
                     ))}
                     {visibleStudents.length === 0 && <p className="text-center text-gray-500 pt-8">No hay alumnos en esta vista.</p>}
                 </div>

                 <form onSubmit={handleAddStudent} className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                     <h3 className="font-semibold text-sm">Añadir Nuevo Alumno</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input type="text" value={newStudent.firstName} onChange={e => setNewStudent(s => ({...s, firstName: e.target.value}))} placeholder="Nombre" required className="p-2 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                        <input type="text" value={newStudent.lastName} onChange={e => setNewStudent(s => ({...s, lastName: e.target.value}))} placeholder="Apellidos" required className="p-2 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                        <input type="email" value={newStudent.email} onChange={e => setNewStudent(s => ({...s, email: e.target.value}))} placeholder="Email (opcional)" className="p-2 bg-gray-800 border border-gray-700 rounded-md text-sm" />
                     </div>
                     <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors">
                        <UserPlusIcon className="w-4 h-4" /> Añadir Alumno
                    </button>
                 </form>
            </div>
        </div>
    );
};