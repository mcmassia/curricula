export interface Entity {
    id: number; // Placeholder, not used for matching
    tipo: number;
    codigo: string | null;
    nombre: string;
    temp_id: string;
}

export interface EvaluableItem {
    parent: Entity;
    children: Entity[];
}

/**
 * Parses a raw SQL script string to extract evaluable items and their relationships.
 * It looks for Competencias Específicas (tipo 20) or Resultados de Aprendizaje (tipo 13) as parents,
 * and Criterios de Evaluación (tipo 2) as their children.
 * @param sql The SQL script content from a history item.
 * @returns An array of EvaluableItem objects.
 */
export const parseSqlForEvaluableItems = (sql: string): EvaluableItem[] => {
    const entities = new Map<string, Entity>();
    const allRelations = new Map<string, string[]>(); // Map from parent temp_id to child temp_id[]

    const entityRegex = /INSERT INTO entidades.*?VALUES\s*([\s\S]*?);/gi;
    const valueTupleRegex = /\(\s*(\d+)\s*,\s*(?:'([^']*)'|NULL)\s*,\s*'((?:[^']|'')*)'\s*,\s*'[^']+'\s*,\s*'([^']*)'\s*\)/g;

    for (const insertMatch of sql.matchAll(entityRegex)) {
        const valuesBlock = insertMatch[1];
        for (const valueMatch of valuesBlock.matchAll(valueTupleRegex)) {
             const temp_id = valueMatch[4];
             if (temp_id) {
                const entity: Entity = {
                    id: -1,
                    tipo: parseInt(valueMatch[1].trim(), 10),
                    codigo: valueMatch[2] ? valueMatch[2].replace(/''/g, "'") : null,
                    nombre: valueMatch[3].replace(/''/g, "'"),
                    temp_id: temp_id,
                };
                entities.set(temp_id, entity);
             }
        }
    }

    const relationRegex = /INSERT INTO relaciones.*?VALUES\s*([\s\S]*?);/gi;
    const relationTupleRegex = /\(\(SELECT id FROM entidades WHERE temp_id='([^']*)'\),\s*\(SELECT id FROM entidades WHERE temp_id='([^']*)'\),\s*'[^']*'\)/g;

    for (const insertMatch of sql.matchAll(relationRegex)) {
        const valuesBlock = insertMatch[1];
        for (const valueMatch of valuesBlock.matchAll(relationTupleRegex)) {
            const parentTempId = valueMatch[1];
            const childTempId = valueMatch[2];

            if (!allRelations.has(parentTempId)) {
                allRelations.set(parentTempId, []);
            }
            allRelations.get(parentTempId)!.push(childTempId);
        }
    }

    const findDescendantsOfType = (startNodeId: string, targetType: number, visited: Set<string> = new Set()): Entity[] => {
        if (visited.has(startNodeId)) return [];
        visited.add(startNodeId);

        const childrenIds = allRelations.get(startNodeId) || [];
        let descendants: Entity[] = [];

        for (const childId of childrenIds) {
            const childEntity = entities.get(childId);
            if (childEntity) {
                if (childEntity.tipo === targetType) {
                    descendants.push(childEntity);
                }
                descendants = descendants.concat(findDescendantsOfType(childId, targetType, new Set(visited)));
            }
        }
        return descendants;
    };

    const evaluableItems: EvaluableItem[] = [];
    
    entities.forEach((entity, temp_id) => {
        // Parents can be type 20 (Competencia Específica) or 13 (Resultado de Aprendizaje)
        if (entity.tipo === 20 || entity.tipo === 13) {
            const children = findDescendantsOfType(temp_id, 2); // Find all criteria (type 2)
            
            const uniqueChildren = Array.from(new Map(children.map(item => [item.temp_id, item])).values());

            if (uniqueChildren.length > 0) {
                evaluableItems.push({
                    parent: entity,
                    children: uniqueChildren,
                });
            }
        }
    });

    return evaluableItems;
};


/**
 * Extracts flat lists of competencies, criteria, and knowledge from a raw SQL script.
 * @param sql The SQL script content.
 * @returns An object with arrays for competencies, criteria, and knowledge.
 */
export const extractCurricularItemsFromSql = (sql: string): {
    competencies: string[],
    criteria: string[],
    knowledge: string[]
} => {
    const result = {
        competencies: [] as string[],
        criteria: [] as string[],
        knowledge: [] as string[],
    };

    const entityRegex = /INSERT INTO entidades.*?VALUES\s*([\s\S]*?);/gi;
    const valueTupleRegex = /\(\s*(\d+)\s*,\s*(?:'([^']*)'|NULL)\s*,\s*'((?:[^']|'')*)'\s*,\s*'[^']+'\s*,\s*'([^']*)'\s*\)/g;

    for (const insertMatch of sql.matchAll(entityRegex)) {
        const valuesBlock = insertMatch[1];
        for (const valueMatch of valuesBlock.matchAll(valueTupleRegex)) {
            const tipo = parseInt(valueMatch[1].trim(), 10);
            const nombre = valueMatch[3].replace(/''/g, "'");

            switch (tipo) {
                case 20: // Competencias específicas
                case 13: // Resultados de Aprendizaje (as competency)
                    result.competencies.push(nombre);
                    break;
                case 2: // Criterios evaluación
                    result.criteria.push(nombre);
                    break;
                case 18: // Saberes básicos
                case 3:  // Contenidos
                    result.knowledge.push(nombre);
                    break;
            }
        }
    }

    // Remove duplicates
    result.competencies = [...new Set(result.competencies)];
    result.criteria = [...new Set(result.criteria)];
    result.knowledge = [...new Set(result.knowledge)];

    return result;
};