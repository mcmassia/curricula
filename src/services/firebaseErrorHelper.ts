import { FirebaseErrorDetails } from '../types';

interface FirebaseError extends Error {
    code: string;
}

// Custom error class to carry more context
export class FirestoreServiceError extends Error {
    collectionName: string;
    originalError: unknown;

    constructor(originalError: unknown, collectionName: string) {
        const message = originalError instanceof Error ? originalError.message : String(originalError);
        super(message);
        this.name = 'FirestoreServiceError';
        this.collectionName = collectionName;
        this.originalError = originalError;
    }
}


const isFirebaseError = (error: unknown): error is FirebaseError => {
    return typeof error === 'object' && error !== null && 'code' in error;
};

const getUnderlyingFirebaseError = (error: unknown): FirebaseError | null => {
    if (isFirebaseError(error)) {
        return error;
    }
    if (error instanceof FirestoreServiceError && isFirebaseError(error.originalError)) {
        return error.originalError;
    }
    return null;
}

const generateSolution = (collectionName: string): string => {
    return `
// Pega esta regla dentro de 'rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { ... } }'
// en la pestaña 'Reglas' de tu base de datos Firestore.

match /${collectionName}/{docId} {
  // Permite a un usuario crear un documento si su ID coincide con el 'userId' del documento.
  allow create: if request.auth.uid == request.resource.data.userId;

  // Permite a un usuario leer, actualizar o eliminar sus propios documentos.
  allow read, update, delete: if request.auth.uid == resource.data.userId;
}
    `.trim();
};

const guessCollectionNameFromMessage = (message: string): string | null => {
    if (message.includes('didactic_units')) return 'didactic_units';
    if (message.includes('learning_situations')) return 'learning_situations';
    if (message.includes('class_activities')) return 'class_activities';
    if (message.includes('rubrics')) return 'rubrics';
    if (message.includes('generations')) return 'generations';
    if (message.includes('educational_resources')) return 'educational_resources';
    if (message.includes('students')) return 'students';
    if (message.includes('student_groups')) return 'student_groups';
    return null;
}

export const getFirebaseErrorDetails = (error: unknown): FirebaseErrorDetails | null => {
    const underlyingError = getUnderlyingFirebaseError(error);

    if (!underlyingError) {
        // Handle generic errors if needed, but for now, focus on Firebase errors
        if (error instanceof Error) {
            // Could return a generic error detail object here if desired
        }
        return null;
    }

    const collectionNameFromContext = (error instanceof FirestoreServiceError) ? error.collectionName : null;

    if (underlyingError.code === 'permission-denied') {
        const collection = collectionNameFromContext || guessCollectionNameFromMessage(underlyingError.message) || '[nombre_de_la_coleccion]';
        
        return {
            message: `Error de Permisos en Firestore: Acceso denegado a la colección '${collection}'.`,
            code: underlyingError.code,
            solution: generateSolution(collection)
        };
    }

    if (underlyingError.code === 'failed-precondition' && underlyingError.message.includes('The query requires an index')) {
        const urlMatch = underlyingError.message.match(/(https?:\/\/[^\s]+)/);
        const indexUrl = urlMatch ? urlMatch[0] : '';
        
        return {
            message: 'Índice de Firestore Faltante: La consulta requiere un índice compuesto que no existe.',
            code: underlyingError.code,
            solution: `Para que las consultas complejas como ordenar y filtrar funcionen, Firestore necesita un índice. Haga clic en el enlace proporcionado para crearlo automáticamente en su consola de Firebase.`,
            url: indexUrl
        };
    }
    
    // Return null for other unhandled Firebase errors
    return null;
};