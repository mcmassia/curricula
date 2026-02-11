import React, { useState, useEffect } from 'react';
import { SavedStudent, Student, SavedStudentGroup } from '../types';
import { CloseIcon, SaveIcon, PencilIcon } from './icons';

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: SavedStudent | null;
    groups: SavedStudentGroup[];
    onSave: (studentId: string, updates: Partial<Student>) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student, groups, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Student>>({});

    useEffect(() => {
        if (student) {
            setEditData({
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                idNumber: student.idNumber,
                age: student.age,
                phone: student.phone,
                address: student.address,
                tags: student.tags,
            });
            setIsEditing(false); // Reset to view mode when student changes
        }
    }, [student]);

    if (!isOpen || !student) return null;

    const studentGroups = groups.filter(g => g.studentIds.includes(student.id));

    const handleSave = () => {
        onSave(student.id, editData);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderField = (label: string, value: string | undefined | null) => (
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-gray-200">{value || <span className="italic text-gray-500">No disponible</span>}</p>
        </div>
    );
    
    const renderEditField = (name: keyof Student, label: string) => (
         <div>
            <label htmlFor={name} className="block text-xs text-gray-400">{label}</label>
            <input
                type="text"
                id={name}
                name={name}
                value={editData[name] || ''}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Ficha del Alumno</h2>
                    <div className="flex items-center gap-2">
                         {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors">
                                <PencilIcon className="w-4 h-4"/> Editar
                            </button>
                         )}
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {isEditing ? (
                        <>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderEditField('lastName', 'Apellidos')}
                                {renderEditField('firstName', 'Nombre')}
                           </div>
                            {renderEditField('email', 'Email')}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderEditField('idNumber', 'ID / DNI')}
                                {renderEditField('age', 'Edad')}
                            </div>
                            {renderEditField('phone', 'Teléfono')}
                            {renderEditField('address', 'Dirección')}
                            {renderEditField('tags', 'Etiquetas')}
                        </>
                    ) : (
                         <>
                            <div className="pb-4 border-b border-gray-700">
                                <h3 className="text-2xl font-bold text-white">{student.lastName}, {student.firstName}</h3>
                                <p className="text-gray-400">{student.email}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderField('ID / DNI', student.idNumber)}
                                {renderField('Edad', student.age)}
                            </div>
                            {renderField('Teléfono', student.phone)}
                            {renderField('Dirección', student.address)}
                            {renderField('Etiquetas', student.tags)}
                             <div>
                                <p className="text-xs text-gray-400">Grupos</p>
                                {studentGroups.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {studentGroups.map(g => (
                                            <span key={g.id} className="text-sm bg-gray-700 text-gray-200 px-2 py-1 rounded-md">{g.name}</span>
                                        ))}
                                    </div>
                                ) : (
                                     <p className="text-gray-200"><span className="italic text-gray-500">No asignado a ningún grupo</span></p>
                                )}
                            </div>
                        </>
                    )}
                </div>
                {isEditing && (
                    <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg">
                        <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                        <button onClick={handleSave} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md">
                            <SaveIcon className="w-5 h-5" /> Guardar Cambios
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};