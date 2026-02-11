export interface RubricLevel {
    levelName: string;
    description: string;
    score: string;
}

export interface RubricCriterion {
    criterion: string;
    levels: RubricLevel[];
}

export interface Rubric {
    title: string;
    criteria: RubricCriterion[];
}

export interface RubricHistoryItem {
    id: string;
    subject: string;
    course: string;
    region: string;
    rubric: Rubric;
    createdAt: string;
    // Optional fields for linking to a didactic unit
    unitId?: string;
    unitTitle?: string;
}

// --- NEW UNIFIED STRUCTURE ---

interface ActivitySequence {
    start: string[];
    development: string[];
    closure: string[];
}

interface BasePlan {
    title: string;
    introduction: string;
    curricularConnection: {
        competencies: string[];
        criteria: string[];
        knowledge: string[];
    };
    activitySequence: ActivitySequence;
    methodology: string;
    groupings: string;
    diversity: string;
    resources: {
        materials: string[];
        spaces: string[];
        timing: string;
    };
    evaluation: {
        description: string;
        rubric: Rubric;
    };
}

export interface DidacticUnit extends BasePlan {}

export interface LearningSituation extends BasePlan {
    context: string;
    challenge: string;
    product: string;
}

// --- SAVED TYPES ---

export interface SavedDidacticUnit {
    id: string;
    subject: string;
    course: string;
    region: string;
    unit: DidacticUnit;
    createdAt: string;
    rubricId?: string;
    detailedActivities?: { [activityTitle: string]: string };
    curriculumId?: string; // Link back to the source curriculum
}

export interface SavedLearningSituation {
    id: string;
    subject: string;
    course: string;
    region: string;
    situation: LearningSituation;
    createdAt: string;
    detailedActivities?: { [activityTitle: string]: string };
    curriculumId?: string; // Link back to the source curriculum
}

export interface ClassActivity {
    title: string;
    type: string;
    description: string;
    objectives?: string[];
    duration?: string;
    materials?: string[];
    steps?: string[];
    evaluationNotes?: string;
    competencies: string[];
    criteria: string[];
    knowledge: string[];
    rubric?: Rubric;
    isGradable?: boolean; // Tag for exams
    correctionGuide?: ExamCorrectionGuide; // For saved exams
}

export interface SavedClassActivity {
    id: string;
    subject: string;
    course: string;
    region: string;
    activity: ClassActivity;
    createdAt: string;
    curriculumId?: string; // Link back to the source curriculum
}

// --- STUDENT & GROUP TYPES ---
export interface Student {
    firstName: string;
    lastName: string;
    email?: string;
    idNumber?: string;
    age?: string;
    phone?: string;
    address?: string;
    tags?: string;
}

export interface SavedStudent extends Student {
    id: string;
    createdAt: string;
}

export interface StudentGroup {
    name: string;
    studentIds: string[];
    curriculumIds: string[];
}

export interface SavedStudentGroup extends StudentGroup {
    id: string;
    createdAt: string;
}


// --- UI & ERROR TYPES ---

export interface FirebaseErrorDetails {
    message: string;
    code: string;
    solution: string;
    url?: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    details?: FirebaseErrorDetails;
    url?: string;
}

// --- RESOURCE SUGGESTION TYPES ---
export interface SuggestedResource {
    title: string;
    url: string;
    description: string;
}

export interface SaberWithResources {
    saber: string;
    resources: SuggestedResource[];
}

// --- EDUCATIONAL RESOURCES ---
export interface EducationalResource {
    name: string;
    description: string;
    url: string;
    curriculumId: string; // ID from the history item
    curriculumSubject: string;
}

export interface SavedEducationalResource extends EducationalResource {
    id: string;
    createdAt: string;
}

// --- CHATBOT TYPES ---
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- DASHBOARD TYPES ---
export type RecentItemType = 'curriculum' | 'unit' | 'situation' | 'activity' | 'resource' | 'student' | 'group';
export interface RecentItem {
    id: string;
    type: RecentItemType;
    title: string;
    subTitle: string;
    date: Date;
    view: 'sql' | 'units' | 'situations' | 'activities' | 'resources' | 'students';
    subView?: 'repository';
}

export type SearchResultType = 'curriculum' | 'student' | 'unit' | 'situation' | 'activity' | 'rubric';

export interface SearchResult {
    id: string;
    title: string;
    type: SearchResultType;
    view: 'sql' | 'students' | 'units' | 'situations' | 'activities' | 'rubrics';
    subView: 'repository';
}


// --- EXAM GENERATION TYPES ---
export interface ExamCorrectionGuide {
    multipleChoiceAnswers: { question: string; answer: string }[];
    shortAnswerGuidelines: string[];
    practicalCaseGuidelines: string;
}

export interface ExamData {
    title: string;
    instructions: string;
    multipleChoiceQuestions: { question: string; options: string[] }[];
    shortAnswerQuestions: { question: string }[];
    practicalCase: { question: string };
    correctionGuide: ExamCorrectionGuide;
    gradingRubric: Rubric;
}

// --- PRESENTATION GENERATION TYPES ---
export interface Slide {
    title: string;
    content: string[]; // Array of bullet points
    speakerNotes: string;
}

// --- ASSIGNMENT GRADING TYPES ---
export interface GradingCriterionResult {
    criterion: string;
    suggestedLevel: string;
    suggestedScore: string;
    justification: string;
}

export interface GradingResult {
    scores: GradingCriterionResult[];
    overallFeedback: string;
}