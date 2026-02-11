import { GoogleGenAI } from "@google/genai";
import { EvaluableItem } from "./sqlParser";
import { Rubric, DidacticUnit, LearningSituation, ClassActivity, SaberWithResources, SavedDidacticUnit, ExamData, SavedLearningSituation, Slide, GradingResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const SQL_HEADER = `DROP TABLE IF EXISTS relaciones CASCADE;
DROP TABLE IF EXISTS entidades CASCADE;
DROP TABLE IF EXISTS tipo_elemento CASCADE;

CREATE TABLE tipo_elemento (
   id INTEGER PRIMARY KEY,
   descripcion TEXT
);
INSERT INTO tipo_elemento (id, descripcion) VALUES
   (0, 'Área/Materia/Asignatura/Módulo'),
   (1, 'Bloques'),
   (2, 'Criterios evaluación'),
   (3, 'Contenidos'),
   (4, 'Estándares'),
   (5, 'Competencias clave / Competencias profesionales, personales y sociales'),
   (6, 'Objetivos área'),
   (7, 'Objetivos etapa'),
   (13, 'Resultados aprendizaje'),
   (17, 'Indicadores'),
   (18, 'Saberes básicos'),
   (19, 'Descriptores'),
   (20, 'Competencias específicas');

CREATE TABLE entidades (
   id SERIAL PRIMARY KEY,
   tipo INTEGER NOT NULL REFERENCES tipo_elemento(id),
   codigo TEXT,
   nombre TEXT NOT NULL,
   traza_evalua TEXT NOT NULL
);

CREATE TABLE relaciones (
   id SERIAL PRIMARY KEY,
   id_origen INTEGER NOT NULL REFERENCES entidades(id),
   id_destino INTEGER NOT NULL REFERENCES entidades(id),
   tipo_relacion TEXT NOT NULL
);

-- Se añade una columna temporal para garantizar la unicidad en las relaciones
ALTER TABLE entidades ADD COLUMN temp_id TEXT UNIQUE;
`;

const buildPrompt = (curriculum: string): string => {
  return `
    Eres un sistema experto que transforma el texto de un currículo educativo en un script PostgreSQL con sentencias INSERT.
    
    Dado el siguiente currículo, genera UNICAMENTE las sentencias INSERT para las tablas \`entidades\` y \`relaciones\`, y la sentencia final para eliminar la columna temporal.
    
    Asume que las siguientes tablas ya existen y que se ha añadido una columna temporal \`temp_id\` a \`entidades\`.
    ---
    CREATE TABLE entidades (
       id SERIAL PRIMARY KEY,
       tipo INTEGER NOT NULL,
       codigo TEXT,
       nombre TEXT NOT NULL,
       traza_evalua TEXT NOT NULL,
       temp_id TEXT UNIQUE -- Columna temporal para relaciones
    );

    CREATE TABLE relaciones (
       id SERIAL PRIMARY KEY,
       id_origen INTEGER NOT NULL,
       id_destino INTEGER NOT NULL,
       tipo_relacion TEXT NOT NULL
    );
    ---

    REQUISITOS OBLIGATORIOS PARA LAS SENTENCIAS INSERT:

    1.  **ASIGNACIÓN DE 'tipo' (MÁXIMA PRIORIDAD ABSOLUTA)**: DEBES usar el ID de tipo correcto para cada entidad, sin excepción. La correcta asignación del 'tipo' es la regla más importante de todas. Cualquier desviación de la lista de tipos proporcionada hará que el script sea inútil. Presta máxima atención a esta regla. Esta es la codificación oficial que DEBES seguir:
        -   (0, 'Área/Materia/Asignatura/Módulo')
        -   (1, 'Bloques')
        -   (2, 'Criterios evaluación')
        -   (3, 'Contenidos')
        -   (4, 'Estándares')
        -   (5, 'Competencias clave / Competencias profesionales, personales y sociales')
        -   (6, 'Objetivos área')
        -   (7, 'Objetivos etapa')
        -   (13, 'Resultados aprendizaje')
        -   (17, 'Indicadores')
        -   (18, 'Saberes básicos')
        -   (19, 'Descriptores')
        -   (20, 'Competencias específicas')

    2.  **SINTAXIS SQL ESTRICTA**:
        -   Cada sentencia \`INSERT\` y \`ALTER\` DEBE terminar con un punto y coma (;).
        -   Si un valor de texto contiene una comilla simple ('), DEBES escaparla duplicándola ('').

    3.  **INCLUSIÓN TOTAL**: Genera una sentencia \`INSERT INTO entidades ...\` por CADA elemento curricular. NO OMITAS NINGUNO.

    4.  **COLUMNA 'temp_id' (CRÍTICO)**:
        -   Para CADA \`INSERT\` en \`entidades\`, DEBES generar un identificador de texto ÚNICO y legible para la columna \`temp_id\`.
        -   Ejemplos: 'MODULO_SISTEMAS', 'RA_1_1', 'CRITERIO_1_1_A', 'BLOQUE_1', 'SABER_B1_1'.

    5.  **RELACIONES CON 'temp_id' (CRÍTICO)**:
        -   Para insertar en \`relaciones\`, USA EXCLUSIVAMENTE la columna \`temp_id\` en las subconsultas.
        -   FORMATO: \`INSERT INTO relaciones (id_origen, id_destino, tipo_relacion) VALUES ((SELECT id FROM entidades WHERE temp_id='TEMP_ID_ORIGEN'), (SELECT id FROM entidades WHERE temp_id='TEMP_ID_DESTINO'), 'tipo_relacion');\`

    6.  **LITERALIDAD Y ORDEN**: Usa los nombres y códigos EXACTOS del currículo. **Excepción**: para 'Competencias específicas' (tipo 20), usa 'CE' + número (CE1, CE2...).

    7.  **CAMPO 'traza_evalua'**: Para competencias clave (tipo 5) y objetivos (tipo 6, 7), pon 't'. Para criterios de evaluación (tipo 2), pon 'e'. Para contenidos/saberes (tipo 3, 18) y descriptores (tipo 19), pon 't'. El resto, INCLUIDAS las competencias específicas (tipo 20), pon '0'.

    8.  **RELACIONES EXPLÍCITAS E IMPLÍCITAS**:
        -   Por CADA Resultado de Aprendizaje (tipo 13), crea una relación \`tiene_criterio\` a cada uno de sus Criterios de Evaluación (tipo 2).
        -   **PROCEDIMIENTO PARA DESCRIPTORES: Cuando encuentres una "Competencia Específica" (tipo 20), procesa TODOS sus "Descriptores" (tipo 19) asociados. Por cada descriptor, DEBES crear una relación \`tiene_descriptor\` desde la Competencia (origen) al Descriptor (destino).**
        -   Por CADA Bloque (tipo 1), crea una relación \`incluye_saber\` a cada uno de sus Contenidos/Saberes (tipo 3 o 18).

    9.  **REGLAS PARA CONTENIDOS Y SABERES (CRÍTICO)**:
        -   Si el currículo usa "Saberes básicos", asígnales el \`tipo = 18\`.
        -   Si el currículo usa "Contenidos", asígnales el \`tipo = 3\`.
        -   Si no tienen código explícito, genera uno con el formato \`S.<código_del_bloque_padre>.<número_de_orden>\`.

    10. **LIMPIEZA FINAL**: Al final de TODO el script, añade: \`ALTER TABLE entidades DROP COLUMN temp_id;\`

    11. **SALIDA FINAL (MÁXIMA PRIORIDAD)**: El resultado debe ser un solo bloque de código SQL puro. NO incluyas NUNCA delimitadores de bloque de código Markdown (\`\`\`sql o \`\`\`). Tu respuesta debe empezar directamente con \`INSERT INTO entidades...\`.

    CURRÍCULO A TRANSFORMAR:
    ---
    ${curriculum}
    ---
  `;
};

/**
 * Streams the generated SQL from the Gemini API.
 * @param curriculum The curriculum text.
 * @returns An async iterator of SQL chunks.
 */
export async function* streamGenerateSqlFromCurriculum(curriculum: string) {
    const prompt = buildPrompt(curriculum);
    const result = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    for await (const chunk of result) {
        yield chunk.text;
    }
}

// Helper function for browser-safe Base64 encoding
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


/**
 * Extracts text from a PDF file using the Gemini API.
 * This is a high-precision, literal extraction.
 * @param file The PDF file.
 * @param subject The subject/materia to look for.
 * @param course The course/curso to look for.
 * @returns The extracted curriculum text.
 */
export const extractTextFromPdf = async (file: File, subject: string, course: string): Promise<string> => {
    const base64File = await toBase64(file);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
            {
                parts: [
                    {
                        text: `
                        Eres una herramienta de extracción de texto de alta precisión. Tu única misión es encontrar una sección específica dentro del documento PDF y copiar su contenido de forma literal.

                        REGLAS DE MÁXIMA PRIORIDAD:
                        1.  **LOCALIZAR**: Busca la sección del currículo que corresponda a la materia "${subject}" para el curso "${course}". Ignora CUALQUIER otra materia o curso.
                        2.  **COMIENZO DE EXTRACCIÓN**: Empieza a extraer el texto EXACTAMENTE en la sección de "Competencias Específicas" de la materia y curso indicados. IGNORA TODO EL TEXTO ANTERIOR (prólogos, introducciones, etc.).
                        3.  **CONTENIDO DE COMPETENCIAS**: Para cada Competencia Específica, copia ÚNICAMENTE su primer párrafo descriptivo.
                        4.  **ESTRUCTURA EXACTA**: Sigue la estructura jerárquica del documento. La estructura que debes seguir es: Competencia Específica -> Descriptores -> Criterios de Evaluación. Asegúrate de incluir TODOS los descriptores y TODOS los criterios de cada competencia.
                        5.  **PRECISIÓN ABSOLUTA (CRÍTICO)**: Debes copiar el texto de forma LITERAL. Carácter por carácter.
                            -   PROHIBIDO RESUMIR.
                            -   PROHIBIDO INTERPRETAR.
                            -   PROHIBIDO MODIFICAR.
                            -   PROHIBIDO AÑADIR texto que no esté en el original.
                            -   PROHIBIDO OMITIR texto. Tu trabajo es ser una fotocopiadora precisa.
                        6.  **FINALIZACIÓN**: Termina la extracción después de la última sección de "Saberes Básicos" o "Contenidos" correspondiente a la materia y curso indicados.

                        La fiabilidad y la exactitud literal son la máxima prioridad. No intentes "ayudar" o formatear más allá de preservar la estructura básica.
                        `
                    },
                    {
                        inlineData: {
                            mimeType: file.type,
                            data: base64File
                        }
                    }
                ]
            }
        ]
    });

    return response.text;
};

/**
 * Refines the curriculum text based on user instructions.
 * @param currentText The current curriculum text.
 * @param userRequest The user's instructions for refinement.
 * @returns The refined curriculum text.
 */
export const refineCurriculumText = async (currentText: string, userRequest: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `
            Eres un asistente de edición de texto. Tu tarea es tomar un texto base y aplicar las modificaciones que el usuario te solicita.
            
            REGLAS:
            1.  Aplica la corrección solicitada de la forma más precisa posible.
            2.  Devuelve SIEMPRE el texto COMPLETO y MODIFICADO. No devuelvas solo la parte que has cambiado ni un mensaje de confirmación.
            3.  NO expliques los cambios que has hecho. Simplemente devuelve el texto final.

            EJEMPLO DE FUNCIONAMIENTO:
            ---
            TEXTO BASE:
            Competencia 1:
            - Criterio 1.1
            - Criterio 1.2
            Competencia 2:
            - Criterio 2.1
            
            PETICIÓN DEL USUARIO:
            "Falta el criterio 2.2 para la competencia 2"
            
            TU RESPUESTA (SOLO ESTO):
            Competencia 1:
            - Criterio 1.1
            - Criterio 1.2
            Competencia 2:
            - Criterio 2.1
            - Criterio 2.2
            ---
            
            Ahora, aplica esta lógica a la siguiente petición.
            
            TEXTO BASE:
            ---
            ${currentText}
            ---
            
            PETICIÓN DEL USUARIO:
            ---
            "${userRequest}"
            ---
        `
    });

    return response.text;
};


/**
 * Refines the SQL script based on user instructions.
 * @param currentSql The current SQL script.
 * @param userRequest The user's instructions for refinement.
 * @returns The refined SQL script.
 */
export const refineSqlScript = async (currentSql: string, userRequest: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `
            Eres un experto en PostgreSQL. Tu tarea es tomar un script SQL y corregir los errores que el usuario te indique.

            REGLAS CRÍTICAS:
            1.  Analiza el script SQL base y la petición del usuario.
            2.  Aplica la corrección solicitada de la forma más precisa posible, manteniendo la estructura y sintaxis del resto del script.
            3.  Respeta TODAS las reglas de sintaxis originales, especialmente el uso de 'temp_id' para las relaciones y el escapado de comillas simples ('').
            4.  Devuelve SIEMPRE el script SQL COMPLETO y MODIFICADO.
            5.  NO incluyas explicaciones, comentarios, ni formato markdown. Solo el código SQL puro.

            SCRIPT SQL BASE:
            ---
            ${currentSql}
            ---
            
            PETICIÓN DE CORRECCIÓN DEL USUARIO:
            ---
            "${userRequest}"
            ---
        `
    });

    return response.text;
};

/**
 * Generates a detailed rubric based on selected evaluable items.
 * @param items The list of items (competencies, criteria) to include in the rubric.
 * @returns A structured Rubric object.
 */
export const generateRubric = async (items: { name: string; code: string | null }[]): Promise<Rubric> => {
    const itemList = items.map(item => `- ${item.code ? `(${item.code}) ` : ''}${item.name}`).join('\n');
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un experto en diseño instruccional y evaluación educativa. Tu tarea es generar una rúbrica de evaluación detallada en formato JSON.

            REQUISITOS OBLIGATORIOS:
            1.  **Formato de Salida**: Debes devolver un único objeto JSON válido. No incluyas texto antes o después del JSON, ni uses formato markdown.
            2.  **Estructura del JSON**: El JSON debe seguir esta estructura:
                \`\`\`json
                {
                  "title": "Título Descriptivo de la Rúbrica",
                  "criteria": [
                    {
                      "criterion": "Texto completo del primer criterio de evaluación",
                      "levels": [
                        { "levelName": "Insuficiente", "description": "Descripción detallada y observable para este nivel.", "score": "0-4" },
                        { "levelName": "Suficiente", "description": "Descripción detallada y observable para este nivel.", "score": "5" },
                        { "levelName": "Bien", "description": "Descripción detallada y observable para este nivel.", "score": "6" },
                        { "levelName": "Notable", "description": "Descripción detallada y observable para este nivel.", "score": "7-8" },
                        { "levelName": "Sobresaliente", "description": "Descripción detallada y observable para este nivel.", "score": "9-10" }
                      ]
                    }
                  ]
                }
                \`\`\`
            3.  **Contenido de la Rúbrica**:
                -   Crea un \`title\` conciso y relevante para el conjunto de elementos a evaluar.
                -   Por CADA uno de los elementos de la lista, crea un objeto en el array \`criteria\`.
                -   Para cada criterio, genera 5 niveles de desempeño (\`levels\`) como en el ejemplo.
                -   Las \`description\` de cada nivel deben ser específicas, observables, y mostrar una progresión clara del desempeño, desde el nivel más bajo al más alto.

            Genera la rúbrica para los siguientes elementos:
            ---
            ${itemList}
            ---
        `
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as Rubric;
};

/**
 * Parses raw curriculum text to identify evaluable items.
 * @param text The raw curriculum text.
 * @returns A promise that resolves to an array of EvaluableItem objects.
 */
export const parseTextForEvaluableItems = async (text: string): Promise<EvaluableItem[]> => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un sistema de análisis curricular. Tu tarea es analizar el siguiente texto de un currículo y extraer las "Competencias Específicas" (o "Resultados de Aprendizaje") y sus "Criterios de Evaluación" asociados en un formato JSON estructurado.

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Formato de Salida**: Debes devolver un único array JSON válido. No incluyas texto explicativo antes o después.
            2.  **Estructura del JSON**: El formato DEBE ser el siguiente:
                \`\`\`json
                [
                  {
                    "parent": { "nombre": "Nombre de la Competencia/Resultado", "codigo": "Código si existe, si no null" },
                    "children": [
                      { "nombre": "Nombre del Criterio de Evaluación", "codigo": "Código si existe, si no null" }
                    ]
                  }
                ]
                \`\`\`
            3.  **PRECISIÓN DE CÓDIGOS (CRÍTICO)**: Debes extraer y conservar los códigos literales de los elementos tal y como aparecen en el texto (ej: "1.", "CE.1", "RA1", "a)", "2.1"). Si un elemento no tiene código, el valor debe ser \`null\`.
            4.  **Inclusión Completa**: Asegúrate de incluir TODAS las competencias/resultados y TODOS sus criterios correspondientes.

            Analiza el siguiente texto y genera el JSON:
            ---
            ${text}
            ---
        `
    });
    
    const jsonString = response.text.trim();
    const parsedData: { parent: { nombre: string, codigo: string | null }, children: { nombre: string, codigo: string | null }[] }[] = JSON.parse(jsonString);

    // Convert to EvaluableItem structure
    return parsedData.map((item, index) => ({
        parent: {
            ...item.parent,
            id: index,
            tipo: 0, // Placeholder
            temp_id: `parent_${index}`
        },
        children: item.children.map((child, childIndex) => ({
            ...child,
            id: childIndex,
            tipo: 2, // Placeholder for criterion
            temp_id: `parent_${index}_child_${childIndex}`
        }))
    }));
};

/**
 * Generates 10 detailed didactic units based on the provided curriculum text.
 * @param curriculum The curriculum text.
 * @returns A promise that resolves to an array of DidacticUnit objects.
 */
export const generateDidacticUnits = async (curriculum: string): Promise<DidacticUnit[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un experto en diseño instruccional y pedagogía. Tu tarea es generar un array de 10 Unidades Didácticas detalladas y completas en formato JSON, basadas en el currículo proporcionado.

            REGLA DE MÁXIMA PRIORIDAD:
            La estructura del JSON es OBLIGATORIA. Debes generar un array de 10 objetos, y CADA objeto DEBE contener TODAS las claves definidas en la estructura de ejemplo, sin omitir ninguna. La fiabilidad de la aplicación depende de que sigas esta estructura al 100%.

            ESTRUCTURA JSON OBLIGATORIA PARA CADA UNIDAD DIDÁCTICA:
            \`\`\`json
            {
              "title": "string",
              "introduction": "string",
              "curricularConnection": {
                "competencies": ["string"],
                "criteria": ["string"],
                "knowledge": ["string"]
              },
              "activitySequence": {
                "start": ["string"],
                "development": ["string"],
                "closure": ["string"]
              },
              "methodology": "string",
              "groupings": "string",
              "diversity": "string",
              "resources": {
                "materials": ["string"],
                "spaces": ["string"],
                "timing": "string"
              },
              "evaluation": {
                "description": "string",
                "rubric": {
                  "title": "string",
                  "criteria": [
                    {
                      "criterion": "string",
                      "levels": [
                        { "levelName": "Insuficiente", "description": "string", "score": "0-4" },
                        { "levelName": "Suficiente", "description": "string", "score": "5" },
                        { "levelName": "Bien", "description": "string", "score": "6" },
                        { "levelName": "Notable", "description": "string", "score": "7-8" },
                        { "levelName": "Sobresaliente", "description": "string", "score": "9-10" }
                      ]
                    }
                  ]
                }
              }
            }
            \`\`\`

            REGLAS DE CONTENIDO ADICIONALES:
            1.  **Formato de Salida**: Devuelve un único array JSON válido que contenga 10 objetos.
            2.  **Contenido Detallado**: Para cada una de las 10 unidades, genera contenido detallado y coherente con el currículo proporcionado.
            3.  **Rúbrica Final Obligatoria y Completa (CRÍTICO)**: Para cada unidad, la rúbrica final en la sección 'evaluation' es fundamental. Los criterios ('criterion') de esta rúbrica DEBEN ser una copia exacta y completa de TODOS los 'Criterios de Evaluación' listados en el array 'criteria' de la sección 'curricularConnection' de esa misma unidad. No omitas ni inventes criterios.

            Analiza el currículo y genera el array con 10 unidades didácticas.
            ---
            CURRÍCULO:
            ${curriculum}
            ---
        `
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as DidacticUnit[];
};

/**
 * Generates 6 detailed learning situations based on the provided curriculum text.
 * @param curriculum The curriculum text.
 * @returns A promise that resolves to an array of LearningSituation objects.
 */
export const generateLearningSituations = async (curriculum: string): Promise<LearningSituation[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un experto en diseño instruccional y pedagogía constructivista. Tu tarea es diseñar un array de 6 Situaciones de Aprendizaje innovadoras y completas en formato JSON, basadas en el currículo proporcionado.

            REGLA DE MÁXIMA PRIORIDAD:
            La estructura del JSON es OBLIGATORIA. Debes generar un array de 6 objetos, y CADA objeto DEBE contener TODAS las claves definidas en la estructura de ejemplo, sin omitir ninguna. La fiabilidad de la aplicación depende de que sigas esta estructura al 100%.

            ESTRUCTURA JSON OBLIGATORIA PARA CADA SITUACIÓN DE APRENDIZAJE:
            \`\`\`json
            {
              "title": "string",
              "introduction": "string",
              "context": "string",
              "challenge": "string",
              "product": "string",
              "curricularConnection": {
                "competencies": ["string"],
                "criteria": ["string"],
                "knowledge": ["string"]
              },
              "activitySequence": {
                "start": ["string"],
                "development": ["string"],
                "closure": ["string"]
              },
              "methodology": "string",
              "groupings": "string",
              "diversity": "string",
              "resources": {
                "materials": ["string"],
                "spaces": ["string"],
                "timing": "string"
              },
              "evaluation": {
                "description": "string",
                "rubric": {
                  "title": "string",
                  "criteria": [
                    {
                      "criterion": "string",
                      "levels": [
                        { "levelName": "Insuficiente", "description": "string", "score": "0-4" },
                        { "levelName": "Suficiente", "description": "string", "score": "5" },
                        { "levelName": "Bien", "description": "string", "score": "6" },
                        { "levelName": "Notable", "description": "string", "score": "7-8" },
                        { "levelName": "Sobresaliente", "description": "string", "score": "9-10" }
                      ]
                    }
                  ]
                }
              }
            }
            \`\`\`
            REGLAS DE CONTENIDO ADICIONALES:
            1.  **Formato de Salida**: Devuelve un único array JSON válido que contenga 6 objetos.
            2.  **Contenido Detallado**: Para cada una de las 6 situaciones, genera contenido detallado y coherente con el currículo, incluyendo contexto, reto y producto final.
            3.  **Rúbrica Final Obligatoria y Completa (CRÍTICO)**: Para cada situación, la rúbrica final en la sección 'evaluation' es fundamental. Los criterios ('criterion') de esta rúbrica DEBEN ser una copia exacta y completa de TODOS los 'Criterios de Evaluación' listados en el array 'criteria' de la sección 'curricularConnection' de esa misma situación. No omitas ni inventes criterios.

            Analiza el currículo y genera el array con 6 situaciones de aprendizaje.
            ---
            CURRÍCULO:
            ${curriculum}
            ---
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as LearningSituation[];
};

/**
 * Generates a set of class activities from curriculum text.
 * @param curriculum The curriculum text.
 * @returns A promise that resolves to an array of ClassActivity objects.
 */
export const generateClassActivitiesFromCurriculum = async (curriculum: string): Promise<ClassActivity[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un pedagogo experto en diseño de actividades de aula. Analiza el siguiente currículo y genera un array JSON con 5 propuestas de actividades variadas.

            REQUISITOS:
            1.  **Formato de Salida**: Un único array JSON válido.
            2.  **Estructura JSON**: Cada objeto debe seguir esta estructura:
                \`\`\`json
                {
                  "title": "string",
                  "type": "string",
                  "description": "string",
                  "competencies": ["string"],
                  "criteria": ["string"],
                  "knowledge": ["string"]
                }
                \`\`\`
            3.  **Contenido**:
                -   **title**: Un nombre conciso y atractivo para la actividad.
                -   **type**: Clasifica la actividad (ej: "Introducción", "Desarrollo", "Consolidación", "Evaluación", "Ampliación").
                -   **description**: Una descripción breve de la actividad.
                -   **competencies, criteria, knowledge**: Para cada actividad, extrae del currículo 1-2 ejemplos de los elementos curriculares más relevantes que abordaría.

            CURRÍCULO:
            ---
            ${curriculum}
            ---
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ClassActivity[];
};

/**
 * Generates a single, detailed class activity based on a context and a title.
 * @param context The context from a Didactic Unit or Learning Situation.
 * @param activityTitle The title of the proposed activity to be detailed.
 * @param activityDescription Optional description of the activity from a sequence.
 * @returns A promise that resolves to a single ClassActivity object.
 */
export const generateDetailedActivity = async (context: string, activityTitle: string, activityDescription?: string): Promise<ClassActivity> => {
    
    const descriptionPrompt = activityDescription 
        ? `La actividad propuesta ya tiene una descripción inicial. Tu principal objetivo es DESARROLLAR y ENRIQUECER esta idea, no crear una nueva. Usa la siguiente descripción como base: "${activityDescription}"`
        : `Desarrolla una actividad completamente nueva basada en el título y el contexto.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un diseñador instruccional experto. Tu tarea es tomar una idea de actividad y desarrollarla en un plan de clase completo en formato JSON, incluyendo elementos curriculares y una rúbrica si es evaluable.

            REQUISITOS OBLIGATORIOS:
            1.  **Formato de Salida**: Un único objeto JSON válido.
            2.  **Estructura JSON (CRÍTICO)**: El objeto debe seguir esta estructura exacta:
                \`\`\`json
                {
                  "title": "string",
                  "type": "string",
                  "description": "string",
                  "objectives": ["string"],
                  "duration": "string",
                  "materials": ["string"],
                  "steps": ["string"],
                  "evaluationNotes": "string",
                  "competencies": ["string"],
                  "criteria": ["string"],
                  "knowledge": ["string"],
                  "rubric": {
                    "title": "Rúbrica para [Título de la Actividad]",
                    "criteria": [
                      {
                        "criterion": "Criterio de evaluación de la rúbrica",
                        "levels": [
                          { "levelName": "Insuficiente", "description": "Descripción del nivel", "score": "0-4" },
                          { "levelName": "Suficiente", "description": "Descripción del nivel", "score": "5" },
                          { "levelName": "Bien", "description": "Descripción del nivel", "score": "6" },
                          { "levelName": "Notable", "description": "Descripción del nivel", "score": "7-8" },
                          { "levelName": "Sobresaliente", "description": "Descripción del nivel", "score": "9-10" }
                        ]
                      }
                    ]
                  }
                }
                \`\`\`
            3.  **Contenido Detallado**:
                -   **title**: Usa el título de la actividad proporcionado: "${activityTitle}".
                -   **competencies, criteria, knowledge (OBLIGATORIO)**: Analiza el contexto curricular proporcionado y extrae los 2-3 elementos MÁS RELEVANTES de cada categoría (competencias específicas, criterios de evaluación, saberes básicos) que se trabajan en esta actividad. Debes incluirlos en sus respectivos arrays.
                -   **type**: Infiere el tipo de actividad (ej: "Desarrollo", "Práctica", "Proyecto").
                -   **description**: Una descripción de uno o dos párrafos de la actividad.
                -   **objectives**: Un array con 2-3 objetivos de aprendizaje específicos que el alumno alcanzará con esta actividad.
                -   **duration**: Una estimación del tiempo necesario (ej: "45 minutos", "2 sesiones de 50 minutos").
                -   **materials**: Una lista de materiales necesarios.
                -   **steps**: Un array con las instrucciones detalladas paso a paso para el profesor y los alumnos.
                -   **evaluationNotes**: Un texto breve sobre qué observar o cómo evaluar el desempeño del alumno.
                -   **rubric (CONDICIONAL E OBLIGATORIO SI APLICA)**: Si la actividad es inherentemente evaluable (un proyecto, presentación, etc.), genera una rúbrica completa. Primero, redacta las 'evaluationNotes' describiendo qué y cómo evaluar. Luego, los criterios de la rúbrica DEBEN ser un desglose directo de esas 'evaluationNotes'. Por ejemplo, si las notas mencionan "evaluar la claridad y el uso de vocabulario", la rúbrica debería tener criterios como "Claridad en la Exposición" y "Uso de Vocabulario Técnico". Si la actividad no es evaluable, el valor de "rubric" debe ser \`null\`.

            ${descriptionPrompt}
            
            Desarrolla la actividad "${activityTitle}" basándote en el siguiente contexto curricular:
            ---
            CONTEXTO:
            ${context}
            ---
        `
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (result.rubric === null) {
        delete result.rubric;
    }
    return result as ClassActivity;
};

/**
 * Parses raw curriculum text to extract lists of curricular items.
 * @param text The raw curriculum text.
 * @returns A promise that resolves to an object with arrays of competencies, criteria, and knowledge.
 */
export const parseTextForCurricularItems = async (text: string): Promise<{
    competencies: string[],
    criteria: string[],
    knowledge: string[]
}> => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un sistema de análisis curricular. Tu tarea es analizar el siguiente texto y extraer listas de elementos curriculares en un formato JSON estructurado.

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Formato de Salida**: Debes devolver un único objeto JSON válido.
            2.  **Estructura del JSON**: El formato DEBE ser: \`{ "competencies": ["string"], "criteria": ["string"], "knowledge": ["string"] }\`.
            3.  **Identificación de Elementos**:
                -   Para la clave \`"competencies"\`, busca "Competencias Específicas" o "Resultados de Aprendizaje".
                -   Para la clave \`"criteria"\`, busca "Criterios de Evaluación".
                -   Para la clave \`"knowledge"\`, busca "Saberes Básicos" o "Contenidos".
            4.  **Extracción Literal**: Extrae los textos de los elementos de la forma más literal posible.
            5.  **Listas Completas**: Asegúrate de incluir TODOS los elementos de cada categoría que encuentres.
            6.  **Manejo de Vacíos**: Si no encuentras ningún elemento para una categoría (por ejemplo, no hay "Saberes Básicos" en el texto), DEBES devolver un array vacío (\`[]\`) para esa clave en el JSON. No omitas la clave.

            Analiza el siguiente texto y genera el JSON:
            ---
            ${text}
            ---
        `
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as { competencies: string[], criteria: string[], knowledge: string[] };
};


// --- AI Section Completion Functions ---

const completeSection = async (partialData: any, section: string, modelType: 'unit' | 'situation' | 'activity') => {
    
    let instructions = '';
    switch (modelType) {
        case 'unit':
            instructions = `Eres un experto en diseño instruccional. Completa la sección '${section}' de esta Unidad Didáctica.`;
            break;
        case 'situation':
            instructions = `Eres un experto en pedagogía constructivista. Completa la sección '${section}' de esta Situación de Aprendizaje.`;
            break;
        case 'activity':
            instructions = `Eres un diseñador de actividades de aula. Completa la sección '${section}' de esta Actividad de Clase.`;
            break;
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            ${instructions}

            REGLAS CRÍTICAS:
            1.  **Contexto**: Utiliza la información del objeto JSON parcial proporcionado como contexto para generar contenido coherente.
            2.  **Sección Específica**: Genera ÚNICAMENTE el contenido para la sección '${section}'.
            3.  **Formato de Salida**: Devuelve un único objeto JSON que contenga SOLAMENTE la clave y el valor de la sección solicitada.
                -   Si la sección es un string (ej: "introduction"), devuelve: \`{ "introduction": "texto generado..." }\`
                -   Si la sección es un objeto (ej: "evaluation"), devuelve la estructura completa de ese objeto: \`{ "evaluation": { "description": "...", "rubric": {...} } }\`
                -   **IMPORTANTE (MÁXIMA PRIORIDAD)**: Si la sección solicitada es 'activitySequence', los arrays 'start', 'development' y 'closure' DEBEN contener únicamente un array de strings (Array<string>). NO DEVUELVAS un array de objetos. CADA elemento del array debe ser un string simple.

            OBJETO PARCIAL (CONTEXTO):
            ---
            ${JSON.stringify(partialData, null, 2)}
            ---

            Completa y devuelve la sección '${section}'.
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
};

export const completeDidacticUnitSection = (unit: Partial<DidacticUnit>, section: string) => completeSection(unit, section, 'unit');
export const completeLearningSituationSection = (situation: Partial<LearningSituation>, section: string) => completeSection(situation, section, 'situation');
export const completeClassActivitySection = (activity: Partial<ClassActivity>, section: string) => completeSection(activity, section, 'activity');


const generateBody = async (initialData: any, modelType: 'unit' | 'situation') => {
    let instructions = '';
    let responseStructure = '';

    const commonStructure = `
        "curricularConnection": { "competencies": ["string"], "criteria": ["string"], "knowledge": ["string"] },
        "activitySequence": { "start": ["string"], "development": ["string"], "closure": ["string"] },
        "methodology": "string",
        "groupings": "string",
        "diversity": "string",
        "resources": { "materials": ["string"], "spaces": ["string"], "timing": "string" },
        "evaluation": {
            "description": "string",
            "rubric": {
                "title": "string",
                "criteria": [{
                    "criterion": "string",
                    "levels": [
                        { "levelName": "Insuficiente", "description": "string", "score": "0-4" },
                        { "levelName": "Suficiente", "description": "string", "score": "5" },
                        { "levelName": "Bien", "description": "string", "score": "6" },
                        { "levelName": "Notable", "description": "string", "score": "7-8" },
                        { "levelName": "Sobresaliente", "description": "string", "score": "9-10" }
                    ]
                }]
            }
        }
    `;

    if (modelType === 'unit') {
        instructions = `Eres un experto en diseño instruccional. Dada la siguiente idea inicial para una Unidad Didáctica (título e introducción), genera el resto de las secciones.`;
        responseStructure = `{ ${commonStructure} }`;
    } else {
        instructions = `Eres un experto en pedagogía constructivista. Dada la siguiente idea inicial para una Situación de Aprendizaje (título, introducción, contexto, reto, producto), genera el resto de las secciones.`;
        responseStructure = `{ ${commonStructure} }`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: { responseMimeType: 'application/json' },
        contents: `
            ${instructions}

            REGLAS CRÍTICAS:
            1.  **Contexto**: Basa todo el contenido generado en la idea inicial proporcionada.
            2.  **Formato de Salida**: Devuelve un único objeto JSON que contenga SOLAMENTE las claves y valores de las secciones generadas. La estructura debe ser: ${responseStructure}
            3.  **Rúbrica Obligatoria**: La rúbrica final DEBE basarse en los 'Criterios de Evaluación' que generes en 'curricularConnection'.
            4.  **Secuencia de Actividades**: Los arrays 'start', 'development' y 'closure' DEBEN contener strings simples.

            IDEA INICIAL (CONTEXTO):
            ---
            ${JSON.stringify(initialData, null, 2)}
            ---

            Genera y devuelve el resto de las secciones.
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
};

export const generateUnitBody = (unit: Partial<DidacticUnit>) => generateBody(unit, 'unit');
export const generateSituationBody = (situation: Partial<LearningSituation>) => generateBody(situation, 'situation');

/**
 * Suggests educational resources for a list of "saberes".
 * @param saberes A list of knowledge items.
 * @returns A promise that resolves to an array of saberes with their suggested resources.
 */
export const suggestResourcesForSaberes = async (saberes: string[]): Promise<SaberWithResources[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            tools: [{googleSearch: {}}],
        },
        contents: `
            Eres un experto bibliotecario y curador de contenido educativo digital. Tu tarea es encontrar los mejores recursos educativos en la web para una lista de "saberes básicos" (contenidos curriculares).

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Búsqueda Web**: Utiliza la búsqueda web para encontrar recursos ACTUALES y de ALTA CALIDAD. Prioriza fuentes fiables como universidades, museos, ONGs educativas (Khan Academy), canales de divulgación científica de prestigio (ej. Kurzgesagt, SmarterEveryDay) y agencias gubernamentales (NASA, ESA).
            2.  **Formato de Salida**: Debes devolver un único array JSON válido. La estructura DEBE ser:
                \`\`\`json
                [
                  {
                    "saber": "Nombre del saber básico original",
                    "resources": [
                      {
                        "title": "Título claro y descriptivo del recurso",
                        "url": "URL directa y funcional al recurso",
                        "description": "Una descripción concisa (1-2 frases) que explique por qué el recurso es útil y qué formato tiene (vídeo, simulación, artículo, etc.)."
                      }
                    ]
                  }
                ]
                \`\`\`
            3.  **Cantidad y Variedad**: Para CADA saber de la lista, encuentra 1 o 2 recursos. Si es posible, ofrece variedad (ej. un vídeo y un artículo interactivo).
            4.  **Idioma**: Los recursos deben estar preferentemente en español.
            5.  **Coherencia**: Asegúrate de que cada objeto en el array principal corresponda a uno de los saberes de la lista de entrada.

            Busca recursos para la siguiente lista de saberes:
            ---
            ${JSON.stringify(saberes)}
            ---
        `
    });

    let jsonString = response.text.trim();
    const match = jsonString.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (match && match[1]) {
        jsonString = match[1];
    }
    return JSON.parse(jsonString) as SaberWithResources[];
};

/**
 * Generates an exam based on the criteria of selected didactic units or learning situations.
 * @param plans An array of selected SavedDidacticUnit or SavedLearningSituation objects.
 * @returns A promise that resolves to a structured ExamData object.
 */
export const generateExam = async (plans: (SavedDidacticUnit | SavedLearningSituation)[]): Promise<ExamData> => {
    if (plans.length === 0) {
        throw new Error("No plans provided for exam generation.");
    }
    const firstPlan = plans[0];
    const planType = 'unit' in firstPlan ? "Unidades Didácticas" : "Situaciones de Aprendizaje";
    
    const titles = plans.map(p => ('unit' in p ? p.unit.title : p.situation.title)).join(', ');
    const allCriteria = plans.flatMap(p => ('unit' in p ? p.unit : p.situation).curricularConnection?.criteria || []);
    const uniqueCriteria = [...new Set(allCriteria)];
    const allKnowledge = plans.flatMap(p => ('unit' in p ? p.unit : p.situation).curricularConnection?.knowledge || []);
    const uniqueKnowledge = [...new Set(allKnowledge)];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un profesor experto en diseño de evaluaciones. Tu tarea es crear una prueba de evaluación completa y estructurada en formato JSON, basada en los datos de las planificaciones proporcionadas.

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Formato de Salida**: Tu respuesta DEBE ser un único objeto JSON válido. No incluyas texto antes, después, ni formato markdown.
            2.  **Contexto (CRÍTICO)**: La prueba debe basarse ESTRICTAMENTE en la materia, curso, criterios de evaluación y saberes básicos proporcionados. Si la materia es un idioma (ej: "Segunda Lengua Extranjera: Francés"), TODA la prueba (preguntas, enunciados, etc.) debe estar en ese idioma.
            3.  **Estructura del JSON (OBLIGATORIA)**: El objeto JSON debe seguir esta estructura exacta:
                \`\`\`json
                {
                  "title": "string",
                  "instructions": "string",
                  "multipleChoiceQuestions": [ { "question": "string", "options": ["string", "string", "string", "string"] } ],
                  "shortAnswerQuestions": [ { "question": "string" } ],
                  "practicalCase": { "question": "string" },
                  "correctionGuide": {
                    "multipleChoiceAnswers": [ { "question": "string", "answer": "string" } ],
                    "shortAnswerGuidelines": ["string"],
                    "practicalCaseGuidelines": "string"
                  },
                  "gradingRubric": {
                    "title": "string",
                    "criteria": [
                      {
                        "criterion": "string",
                        "levels": [
                          { "levelName": "Insuficiente", "description": "string", "score": "0-4" },
                          { "levelName": "Suficiente", "description": "string", "score": "5" },
                          { "levelName": "Bien", "description": "string", "score": "6" },
                          { "levelName": "Notable", "description": "string", "score": "7-8" },
                          { "levelName": "Sobresaliente", "description": "string", "score": "9-10" }
                        ]
                      }
                    ]
                  }
                }
                \`\`\`
             4. **Cantidad de Preguntas**: Genera EXACTAMENTE 5 preguntas de opción múltiple, 3 de desarrollo corto y 1 supuesto práctico.
             5. **Contenido de la Guía**: La \`correctionGuide\` debe ser completa y útil para un profesor. Las \`multipleChoiceAnswers\` deben corresponder a las preguntas generadas. Las \`shortAnswerGuidelines\` y \`practicalCaseGuidelines\` deben ofrecer puntos clave, ejemplos de respuestas válidas o criterios de corrección.
             6. **Contenido de la Rúbrica**: La \`gradingRubric\` debe ser específica para esta prueba, con criterios que permitan calificar las distintas secciones (ej: "Precisión en opción múltiple", "Profundidad en preguntas de desarrollo", "Aplicación en supuesto práctico").

            DATOS PARA LA GENERACIÓN:
            - Materia: ${firstPlan.subject}
            - Curso: ${firstPlan.course}
            - Planificaciones Base (${planType}): ${titles}
            - Criterios de Evaluación a cubrir: ${JSON.stringify(uniqueCriteria)}
            - Saberes Básicos a cubrir: ${JSON.stringify(uniqueKnowledge)}

            Genera el objeto JSON de la prueba.
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ExamData;
};

/**
 * Generates a single, detailed class activity based on the content of a URL.
 * @param url The URL of the web resource.
 * @param subject The subject for which the activity is intended.
 * @param course The course for which the activity is intended.
 * @returns A promise that resolves to a single ClassActivity object.
 */
export const generateActivityFromUrl = async (url: string, subject: string, course: string): Promise<ClassActivity> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            tools: [{ googleSearch: {} }],
        },
        contents: `
            Eres un diseñador instruccional experto, especializado en crear actividades de aula para la materia de "${subject}" y el curso de "${course}". Tu tarea es analizar el contenido de la siguiente URL y, basándote en él, generar un plan de clase completo y RELEVANTE en formato JSON.

            REQUISITOS OBLIGATORIOS:
            1.  **Análisis de Contenido**: Usa la búsqueda web para analizar el contenido de la URL. Si es un vídeo (ej. YouTube), analiza su título y descripción para inferir el tema.
            2.  **Contexto Pedagógico**: La actividad debe ser apropiada para la materia "${subject}" y el curso de "${course}".
            3.  **REGLA DE IDIOMA (CRÍTICO)**: Si la materia es un idioma (ej: "Francés", "Inglés"), DEBES generar TODA la actividad (title, description, steps, etc.) en ESE IDIOMA. Si no es un idioma, genera la actividad en español.
            4.  **Formato de Salida**: Tu respuesta DEBE ser un único objeto JSON válido, envuelto en un bloque de código markdown (\`\`\`json ... \`\`\`). No incluyas texto fuera del bloque.
            5.  **Estructura JSON (CRÍTICO)**:
                \`\`\`json
                {
                  "title": "string", 
                  "type": "Desarrollo",
                  "description": "string",
                  "objectives": ["string"],
                  "duration": "string",
                  "materials": ["string"],
                  "steps": ["string"],
                  "evaluationNotes": "string",
                  "competencies": [],
                  "criteria": [],
                  "knowledge": [],
                  "rubric": null
                }
                \`\`\`
            6.  **Contenido Detallado y Relevante**:
                -   \`title\` y \`description\` deben conectar DIRECTAMENTE con el tema del recurso.
                -   \`materials\`: El primer elemento DEBE ser la URL del recurso original.
                -   \`steps\`: Deben ser pasos prácticos para usar el recurso en el aula.
                -   Deja los campos curriculares (\`competencies\`, etc.) vacíos o como \`null\`.

            URL a analizar: ${url}
        `
    });

    let jsonString = response.text.trim();
    const match = jsonString.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (match && match[1]) {
        jsonString = match[1];
    }
    return JSON.parse(jsonString) as ClassActivity;
};


/**
 * Generates a single, detailed class activity based on the content of a file.
 * @param file The file (PDF, TXT, etc.) to analyze.
 * @param subject The subject for which the activity is intended.
 * @param course The course for which the activity is intended.
 * @returns A promise that resolves to a single ClassActivity object.
 */
export const generateActivityFromFile = async (file: File, subject: string, course: string): Promise<ClassActivity> => {
    const base64File = await toBase64(file);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json',
        },
        contents: [
            {
                parts: [
                    {
                        text: `
                        Eres un diseñador instruccional experto, especializado en crear actividades de aula para la materia de "${subject}" y el curso de "${course}". Tu tarea es analizar el contenido del documento adjunto y, basándote en él, generar un plan de clase completo y relevante en formato JSON.

                        REQUISITOS OBLIGATORIOS:
                        1.  **Análisis de Documento**: Analiza a fondo el contenido del fichero.
                        2.  **Contexto Pedagógico**: La actividad generada debe ser apropiada para la materia de "${subject}" y el curso de "${course}".
                        3.  **REGLA DE IDIOMA (CRÍTICO)**: Si la materia es un idioma (ej: "Francés", "Inglés"), DEBES generar TODA la actividad (title, description, steps, etc.) en ESE IDIOMA. Si no es un idioma, genera la actividad en español.
                        4.  **Formato de Salida**: Un único objeto JSON válido.
                        5.  **Estructura JSON (CRÍTICO)**:
                            \`\`\`json
                            {
                              "title": "string",
                              "type": "Desarrollo",
                              "description": "string",
                              "objectives": ["string"],
                              "duration": "string",
                              "materials": ["string"],
                              "steps": ["string"],
                              "evaluationNotes": "string",
                              "competencies": [],
                              "criteria": [],
                              "knowledge": [],
                              "rubric": null
                            }
                            \`\`\`
                        6.  **Contenido Detallado y Relevante**:
                            -   Crea un \`title\` y una \`description\` que conecten directamente con el documento.
                            -   En \`materials\`, incluye "Documento adjunto".
                            -   Los \`steps\` deben ser prácticos y guiar al profesor en el uso del documento.
                             -  Deja los campos curriculares vacíos o como \`null\`.
                        `
                    },
                    {
                        inlineData: {
                            mimeType: file.type,
                            data: base64File
                        }
                    }
                ]
            }
        ]
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ClassActivity;
};

/**
 * Generates a presentation from a Didactic Unit or Learning Situation.
 * @param plan The saved unit or situation.
 * @returns A promise that resolves to an array of Slide objects.
 */
export const generatePresentation = async (plan: SavedDidacticUnit | SavedLearningSituation): Promise<Slide[]> => {
    const planType = 'unit' in plan ? "Unidad Didáctica" : "Situación de Aprendizaje";
    const planContent = 'unit' in plan ? plan.unit : plan.situation;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: `
            Eres un experto en comunicación y diseño de presentaciones educativas. Tu tarea es convertir una planificación (${planType}) en un conjunto de diapositivas claras, concisas y visuales, en formato JSON.

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Formato de Salida**: Tu respuesta DEBE ser un único array JSON válido. No incluyas texto antes, después, ni formato markdown.
            2.  **Estructura del JSON (OBLIGATORIA)**: El array debe contener entre 10 y 15 objetos, y cada objeto debe seguir esta estructura exacta:
                \`\`\`json
                {
                  "title": "string",
                  "content": ["string", "string"],
                  "speakerNotes": "string"
                }
                \`\`\`
            3.  **Contenido de las Diapositivas**:
                -   **title**: Un título claro y directo para la diapositiva.
                -   **content**: Un array con 2 a 5 puntos clave (viñetas). El contenido debe ser conciso, ideal para ser proyectado. NO uses frases largas.
                -   **speakerNotes**: Notas para el orador (el profesor). Aquí puedes añadir detalles, ejemplos, preguntas para la clase o recordatorios que no aparecen en la diapositiva.
            4.  **Flujo Lógico**: La secuencia de diapositivas debe seguir un orden lógico: introducción, desarrollo de contenidos y actividades, y conclusión/evaluación.
            5.  **Análisis del Contenido**: Basa las diapositivas en TODOS los apartados de la planificación proporcionada, incluyendo la conexión curricular, la secuencia de actividades, la metodología, etc.

            PLANIFICACIÓN A CONVERTIR:
            ---
            ${JSON.stringify(planContent, null, 2)}
            ---

            Genera el array JSON con las diapositivas.
        `
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as Slide[];
};

/**
 * Generates a worksheet in Markdown format based on a Didactic Unit.
 * @param unit The saved didactic unit.
 * @returns A promise that resolves to a Markdown string.
 */
export const generateWorksheetMarkdown = async (unit: SavedDidacticUnit): Promise<string> => {
    const unitContent = unit.unit;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `
            Eres un profesor creativo y experto en diseño de materiales didácticos. Tu tarea es generar una ficha de trabajo (worksheet) para alumnos en formato Markdown, basada en la siguiente Unidad Didáctica.

            REGLAS DE MÁXIMA PRIORIDAD:
            1.  **Formato de Salida**: Tu respuesta DEBE ser únicamente texto en formato Markdown. No incluyas explicaciones ni texto fuera del contenido de la ficha.
            2.  **Contenido de la Ficha**:
                -   Crea un título principal para la ficha usando \`#\`.
                -   Añade una breve introducción para el alumno.
                -   Diseña una variedad de ejercicios (entre 3 y 5 secciones) que cubran los saberes y criterios de la unidad.
                -   Utiliza diferentes tipos de ejercicios, como:
                    -   Preguntas de respuesta corta (usando \`###\` para cada pregunta).
                    -   Ejercicios de rellenar huecos (usando \`___\` para los espacios en blanco).
                    -   Un pequeño caso práctico o problema a resolver.
                    -   Preguntas de verdadero/falso.
            3.  **Contexto**: Basa TODO el contenido de los ejercicios en los saberes básicos y los criterios de evaluación de la unidad proporcionada. La ficha debe ser 100% relevante para esta unidad.
            4.  **Diseño Limpio**: Usa la sintaxis de Markdown de forma clara y organizada para que la ficha sea legible y fácil de seguir para un alumno.

            UNIDAD DIDÁCTICA DE REFERENCIA:
            ---
            Título: ${unitContent.title}
            Materia: ${unit.subject}
            Curso: ${unit.course}
            Saberes Básicos: ${JSON.stringify(unitContent.curricularConnection.knowledge)}
            Criterios de Evaluación: ${JSON.stringify(unitContent.curricularConnection.criteria)}
            ---

            Genera ahora la ficha de trabajo en Markdown.
        `
    });

    return response.text.trim();
};

/**
 * Grades a student's assignment against a rubric using AI.
 * @param assignmentFile The student's work as a file part for the Gemini API.
 * @param rubric The rubric to grade against.
 * @returns A promise that resolves to a structured GradingResult object.
 */
export const gradeAssignment = async (
    assignmentFile: { inlineData: { mimeType: string, data: string } },
    rubric: Rubric
): Promise<GradingResult> => {
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        config: {
            responseMimeType: 'application/json'
        },
        contents: [
            {
                parts: [
                    {
                        text: `
                        Eres un profesor experto y un evaluador justo. Tu tarea es analizar el trabajo de un alumno (adjunto) y calificarlo de acuerdo a la rúbrica proporcionada.

                        REGLAS DE MÁXIMA PRIORIDAD:
                        1.  **Formato de Salida**: Debes devolver un único objeto JSON válido, sin texto adicional ni formato markdown.
                        2.  **Análisis Detallado**: Para CADA criterio de la rúbrica, analiza el trabajo del alumno y determina qué nivel de desempeño ha alcanzado.
                        3.  **Estructura del JSON (OBLIGATORIA)**:
                            \`\`\`json
                            {
                              "scores": [
                                {
                                  "criterion": "El texto completo del primer criterio de la rúbrica",
                                  "suggestedLevel": "El nombre del nivel alcanzado (ej: 'Notable')",
                                  "suggestedScore": "El rango de puntuación de ese nivel (ej: '7-8')",
                                  "justification": "Una justificación breve y específica, citando ejemplos del trabajo del alumno si es posible, que explique por qué se ha asignado ese nivel."
                                }
                              ],
                              "overallFeedback": "Un párrafo de feedback constructivo y global para el alumno. Debe destacar los puntos fuertes y sugerir áreas claras de mejora, manteniendo un tono de apoyo y ánimo."
                            }
                            \`\`\`
                        4.  **Coherencia**: La justificación de cada criterio debe estar directamente relacionada con el contenido del trabajo del alumno. El feedback global debe ser un resumen coherente de los puntos evaluados.

                        RÚBRICA DE EVALUACIÓN:
                        ---
                        ${JSON.stringify(rubric, null, 2)}
                        ---

                        Analiza el trabajo del alumno adjunto y genera el informe JSON.
                        `
                    },
                    assignmentFile
                ]
            }
        ]
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as GradingResult;
};