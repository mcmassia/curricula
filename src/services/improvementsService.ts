export interface Improvement {
    title: string;
    description: string;
    prompt: string; // Instructions for the developer AI
}

const ALL_IMPROVEMENTS: Improvement[] = [
    {
        title: "Planificador Anual/Trimestral",
        description: "Genera una propuesta de distribución y secuenciación de tus Unidades Didácticas a lo largo de un curso académico o trimestre.",
        prompt: "Crea una nueva sección 'Planificador Anual'. El usuario seleccionará varias Unidades Didácticas de su repositorio. La IA debe generar una tabla markdown proponiendo una distribución temporal (ej. Semana 1-4: UD1, Semana 5-8: UD2), junto con una justificación pedagógica para esa secuencia."
    },
    {
        title: "Generador de Exámenes y Pruebas",
        description: "A partir de una Unidad Didáctica o un conjunto de saberes, crea automáticamente una prueba de evaluación con diferentes tipos de preguntas.",
        prompt: "Crea una nueva función 'Generar Examen' en el repositorio de Unidades Didácticas. La IA debe analizar la unidad y generar una prueba en formato markdown con 3 tipos de preguntas: 5 preguntas de opción múltiple, 3 preguntas de desarrollo corto y 1 supuesto práctico."
    },
    {
        title: "Analizador de Trabajos de Alumnos con IA",
        description: "Sube el trabajo de un alumno (texto o PDF) y una rúbrica, y la IA proporcionará una evaluación inicial y feedback.",
        prompt: "Implementa una nueva sección 'Evaluar Trabajo'. El usuario subirá un archivo de texto y seleccionará una Rúbrica de su repositorio. La IA debe devolver un informe JSON con una puntuación sugerida para cada criterio de la rúbrica y un párrafo de feedback constructivo para el alumno."
    },
    {
        title: "Generador de Actividades de Refuerzo/Ampliación",
        description: "Basado en los resultados de una evaluación, genera actividades personalizadas para reforzar áreas débiles o ampliar conocimientos.",
        prompt: "En el repositorio de Actividades, añade un botón 'Generar Relacionadas'. La IA debe crear dos nuevas actividades: una de 'Refuerzo' (simplificando la tarea original o centrándose en los prerrequisitos) y una de 'Ampliación' (proponiendo un reto más complejo o una aplicación a un nuevo contexto)."
    },
    {
        title: "Banco de Recursos Comunitario",
        description: "Permite a los usuarios compartir de forma anónima sus Recursos Educativos mejor valorados, creando una biblioteca colaborativa.",
        prompt: "Crea una nueva sección 'Comunidad'. Los usuarios podrán 'publicar' un recurso de su repositorio. Implementa un sistema de 'likes' y muestra los recursos más populares de la comunidad, manteniendo el anonimato del autor."
    },
    {
        title: "Creador de Contenido a partir de Recursos",
        description: "Proporciona una URL (ej. un vídeo de YouTube, un artículo) y la IA generará una Actividad de Clase completa basada en ese recurso.",
        prompt: "En el generador de Actividades, añade una pestaña 'Desde URL'. El usuario pegará un enlace. Usando Google Search, la IA debe analizar el contenido del enlace y generar una Actividad de Clase completa (objetivos, pasos, evaluación) para explotar ese recurso en el aula."
    },
    {
        title: "Creador de Presentaciones",
        description: "Genera un esquema detallado y el contenido para cada diapositiva de una presentación (PowerPoint, Google Slides) sobre una Unidad Didáctica.",
        prompt: "En el repositorio de Unidades Didácticas, añade una opción 'Crear Presentación'. La IA debe generar un array JSON donde cada objeto representa una diapositiva, con una clave 'titulo' y otra 'contenido' (en formato de viñetas)."
    },
    {
        title: "Generador de Fichas/Worksheets",
        description: "Crea fichas de trabajo en formato PDF listas para imprimir, con ejercicios basados en los saberes de una Unidad Didáctica.",
        prompt: "Añade una función 'Generar Ficha PDF' en el repositorio de Unidades. La IA creará contenido en markdown (preguntas, ejercicios de rellenar huecos, etc.). Usa una librería como jsPDF para convertir ese markdown en un PDF descargable con un diseño limpio."
    },
    {
        title: "Asistente de Proyectos (ABP/PBL)",
        description: "Guía al profesor en la creación de un proyecto por fases, desde la idea inicial y la pregunta guía hasta las tareas y la evaluación.",
        prompt: "Crea una nueva sección 'Asistente de Proyectos'. Será un wizard de varios pasos. Paso 1: El usuario introduce un tema. Paso 2: La IA sugiere una 'pregunta guía'. Paso 3: La IA desglosa el proyecto en tareas. Paso 4: La IA genera la rúbrica de evaluación del producto final."
    },
    {
        title: "Importación/Exportación a Google Docs",
        description: "Permite importar contenido desde un Google Doc y exportar Unidades Didácticas o Situaciones de Aprendizaje a un documento de Google.",
        prompt: "Implementa la autenticación con la API de Google. Añade botones 'Importar de Google Docs' y 'Exportar a Google Docs'. Para exportar, la IA formateará el JSON de una unidad en un texto bien estructurado y usará la API para crear un nuevo documento en el Drive del usuario."
    },
    {
        title: "Dashboard Personalizado Avanzado",
        description: "Muestra estadísticas de uso, tus últimos elementos editados, y sugiere qué podrías hacer a continuación.",
        prompt: "Mejora el `WelcomePanel`. Usa los datos de los repositorios para mostrar: 'Editados recientemente', 'Tu currículo más usado', y una tarjeta de 'Sugerencia IA' como '¿Por qué no creas actividades para tu última unidad didáctica?'."
    },
    {
        title: "Asistente Virtual (Chatbot)",
        description: "Un chatbot integrado en la aplicación que responde a preguntas sobre cómo usar las herramientas y puede ejecutar acciones simples.",
        prompt: "Añade un icono de chat flotante. Al abrirlo, se inicia una conversación con la IA. El chat debe tener un `systemInstruction` que le dé conocimiento sobre las funciones de la app. Implementa `function-calling` para que comandos como 'muéstrame mis rúbricas de 1º ESO' ejecuten un filtro en la UI."
    },
    {
        title: "Colaboración en Tiempo Real",
        description: "Permite a varios profesores editar una Unidad Didáctica, Situación de Aprendizaje o Actividad de forma simultánea.",
        prompt: "Integra una solución de tiempo real (como Firestore listeners o una librería específica). En los editores, implementa un sistema para 'invitar' a otro usuario por email. Los cambios de un usuario deben reflejarse instantáneamente en la pantalla del otro."
    },
    {
        title: "Traductor de Materiales Educativos",
        description: "Traduce una Actividad de Clase, Unidad o Situación a múltiples idiomas para apoyar a aulas con diversidad lingüística.",
        prompt: "En los repositorios, añade un botón 'Traducir'. Al pulsarlo, un modal pregunta el idioma de destino. La IA debe traducir todo el contenido del elemento, prestando especial atención a mantener el formato y la terminología pedagógica."
    },
    {
        title: "Adaptador a Lectura Fácil",
        description: "Convierte automáticamente los textos de una planificación (introducción, descripciones, etc.) a un formato de Lectura Fácil.",
        prompt: "Añade un toggle 'Lectura Fácil' en los repositorios. Al activarlo, la IA procesará los textos del elemento seleccionado y los reemplazará con una versión simplificada, siguiendo las directrices de Lectura Fácil (frases cortas, vocabulario sencillo, etc.)."
    },
    {
        title: "Analizador de Sesgos Curriculares",
        description: "Revisa una Unidad Didáctica o Situación de Aprendizaje en busca de posibles sesgos de género, culturales o socioeconómicos.",
        prompt: "Añade un botón 'Analizar Sesgos' en los editores. La IA debe revisar todo el texto y generar un informe que señale frases o planteamientos que podrían ser problemáticos y sugerir alternativas más inclusivas."
    },
    {
        title: "Conector de Unidades Didácticas",
        description: "La IA analiza dos de tus unidades y sugiere actividades 'puente' para conectarlas de forma fluida y coherente.",
        prompt: "En el repositorio de Unidades, permite al usuario seleccionar dos unidades. Añade un botón 'Buscar Conexión'. La IA debe proponer 1-2 actividades que sirvan para recapitular la primera unidad y anticipar los contenidos de la segunda."
    },
    {
        title: "Generador de Objetivos Personalizados",
        description: "Crea objetivos de aprendizaje específicos para una actividad, basados en la taxonomía de Bloom o SOLO.",
        prompt: "En el editor de Actividades, junto al campo 'Objetivos', añade un botón 'Sugerir Objetivos (Bloom)'. La IA debe analizar el título y la descripción de la actividad y proponer 3 objetivos que escalen en nivel cognitivo (ej. Recordar, Aplicar, Crear)."
    },
    {
        title: "Generador de Debates y Dilemas",
        description: "A partir de los saberes de un currículo, propone temas de debate o dilemas éticos para fomentar el pensamiento crítico.",
        prompt: "Crea una nueva utilidad en la sección 'Utilidades'. El usuario introduce un tema (ej. 'La Revolución Industrial'). La IA debe generar 3 preguntas de debate o dilemas morales relacionados, junto con posibles argumentos a favor y en contra para guiar la discusión."
    },
    {
        title: "Evaluación entre Pares (Peer-Review)",
        description: "Genera pautas y rúbricas simplificadas para que los alumnos puedan evaluar el trabajo de sus compañeros de forma constructiva.",
        prompt: "Añade una opción 'Generar Rúbrica de Coevaluación' en el repositorio de Rúbricas. La IA debe tomar una rúbrica de profesor existente y crear una versión simplificada, con un lenguaje adaptado para los alumnos y con 2-3 niveles de desempeño claros."
    }
];

/**
 * Gets the initial list of improvements to display.
 * @param count The number of improvements to return.
 * @returns An array of Improvement objects.
 */
export const getInitialImprovements = (count: number): Improvement[] => {
    const shuffled = [...ALL_IMPROVEMENTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

/**
 * Gets a new, unique improvement that is not in the current list.
 * @param existingImprovements The list of improvements currently being displayed.
 * @returns A new Improvement object, or null if all have been used.
 */
export const getNewImprovement = (existingImprovements: Improvement[]): Improvement | null => {
    const existingTitles = new Set(existingImprovements.map(imp => imp.title));
    const availableImprovements = ALL_IMPROVEMENTS.filter(imp => !existingTitles.has(imp.title));

    if (availableImprovements.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableImprovements.length);
    return availableImprovements[randomIndex];
};