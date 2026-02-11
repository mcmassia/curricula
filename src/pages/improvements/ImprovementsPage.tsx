
import React, { useState } from 'react';
import { ImprovementsPanel } from '../../components/ImprovementsPanel';
import { ImprovementPromptModal } from '../../components/ImprovementPromptModal';
import { Improvement } from '../../services/improvementsService';

// Temporary hardcoded improvements list since it was in App.tsx state initially or just static.
// In App.tsx it was `const [improvements, setImprovements] = useState<Improvement[]>([...]);`
// I'll move the data here or to a service/constant if it's static.
// Based on typical patterns, it might be static for now or fetched.
// I'll include the default list here.

const DEFAULT_IMPROVEMENTS: Improvement[] = [
    {
        title: "Generación de Exámenes",
        description: "Crear pruebas escritas personalizadas a partir de unidades didácticas seleccionadas, incluyendo preguntas de desarrollo y tipo test.",
        prompt: "Actúa como un experto docente. Genera un examen escrito basado en la unidad didáctica proporcionada. Incluye 5 preguntas de opción múltiple con justificación de la respuesta correcta y 3 preguntas de desarrollo breve. Añade una clave de corrección al final."
    },
    {
        title: "Adaptación Curricular",
        description: "Generar adaptaciones curriculares significativas y no significativas para alumnos con NEAE, ajustando criterios y actividades.",
        prompt: "Actúa como un especialista en Pedagogía Terapéutica. Realiza una adaptación curricular significativa para un alumno con [INSERTAR NECESIDAD] para la unidad didáctica proporcionada. Ajusta los criterios de evaluación, simplifica los objetivos y propón actividades alternativas que trabajen las mismas competencias."
    },
    {
        title: "Gamificación del Aula",
        description: "Diseñar estrategias de gamificación (badges, leaderboards, misiones) vinculadas a los criterios de evaluación del currículo.",
        prompt: "Diseña una estrategia de gamificación para el trimestre basada en los saberes básicos proporcionados. Define 'Misiones' (actividades), 'Insignias' (logros alcanzados al cumplir criterios) y un sistema de 'Puntos de Experiencia' para la evaluación formativa."
    },
    {
        title: "Proyectos Interdisciplinares",
        description: "Crear proyectos que conecten competencias de múltiples materias (ej. Matemáticas + Historia) en una sola situación de aprendizaje.",
        prompt: "Diseña un proyecto interdisciplinar que conecte la materia de [MATERIA 1] y [MATERIA 2]. El proyecto debe resolver un problema del mundo real. Define el producto final, los criterios de evaluación de ambas materias que se trabajarán y la secuencia de actividades conjunta."
    },
    {
        title: "Presentaciones Automáticas",
        description: "Generar estructuras de diapositivas (para PowerPoint/Canva) para explicar la unidad didáctica en clase.",
        prompt: "Crea la estructura de una presentación de diapositivas para explicar esta unidad didáctica en clase. Para cada diapositiva, indica el Título, los Puntos Clave a tratar y una sugerencia de imagen o gráfico para ilustrar."
    },
    {
        title: "Fichas de Refuerzo",
        description: "Generar ejercicios adicionales y hojas de trabajo para alumnos que necesitan repasar conceptos específicos.",
        prompt: "Genera una ficha de refuerzo con 5 ejercicios prácticos sobre el saber básico [INSERTAR SABER]. Los ejercicios deben ir de menor a mayor dificultad. Incluye un breve resumen teórico al inicio de la ficha."
    }
];

export const ImprovementsPage: React.FC = () => {
    const [improvements, setImprovements] = useState<Improvement[]>(DEFAULT_IMPROVEMENTS);
    const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

    const handleApply = (improvement: Improvement) => {
        setSelectedImprovement(improvement);
        setIsPromptModalOpen(true);
    };

    const handleDelete = (improvement: Improvement) => {
        setImprovements(prev => prev.filter(i => i.title !== improvement.title));
    };

    return (
        <>
            <ImprovementsPanel
                improvements={improvements}
                onApply={handleApply}
                onDelete={handleDelete}
            />
            {selectedImprovement && (
                <ImprovementPromptModal
                    isOpen={isPromptModalOpen}
                    onClose={() => setIsPromptModalOpen(false)}
                    prompt={selectedImprovement.prompt}
                />
            )}
        </>
    );
};
