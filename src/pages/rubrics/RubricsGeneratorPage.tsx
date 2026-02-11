
import React, { useState, useCallback } from 'react';
import { RubricsPanel } from '../../components/RubricsPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { parseSqlForEvaluableItems, EvaluableItem } from '../../services/sqlParser';
import { generateRubric, parseTextForEvaluableItems } from '../../services/geminiService';
import { saveRubricsHistory } from '../../services/rubricHistoryService';
import { HistoryItem } from '../../services/historyService';
import { Rubric, RubricHistoryItem } from '../../types';

export const RubricsGeneratorPage: React.FC = () => {
    const { user } = useAuth();
    const { history, setRubricsHistory } = useData();
    const { addToast } = useToast();

    // State
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
    const [activeTab, setActiveTab] = useState<'sql' | 'text'>('sql'); // Track tab internally or assume RubricsPanel handles? 
    // RubricsPanel doesn't expose tab state explicitly, it infers usage via props.
    // But implementation in App.tsx managed isParsingSql/isParsingText.

    const [isParsingSql, setIsParsingSql] = useState(false);
    const [isParsingText, setIsParsingText] = useState(false);
    const [evaluableItems, setEvaluableItems] = useState<EvaluableItem[]>([]);
    const [selectedEvaluableItems, setSelectedEvaluableItems] = useState<string[]>([]);

    const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
    const [generatedRubric, setGeneratedRubric] = useState<Rubric | null>(null);
    const [rubricError, setRubricError] = useState<string | null>(null);
    const [parentNamesForRubric, setParentNamesForRubric] = useState<Set<string>>(new Set());

    // Local Subject/Course state for Manual Text input scenario
    // RubricsPanel doesn't strictly require these unless we want to autosave with context.
    // App.tsx passed global `subject`, `course`. We should probably track them here too.
    const [manualSubject, setManualSubject] = useState('');
    const [manualCourse, setManualCourse] = useState('');

    const handleSelectHistory = useCallback((item: HistoryItem) => {
        setSelectedHistoryItem(item);
        setIsParsingSql(true);
        setEvaluableItems([]);
        try {
            const items = parseSqlForEvaluableItems(item.sql);
            setEvaluableItems(items);
        } catch (error) {
            console.error("Error parsing SQL for rubric items:", error);
            setRubricError("No se pudieron analizar los elementos evaluables del script SQL.");
        } finally {
            setIsParsingSql(false);
        }
    }, []);

    const handleParseText = useCallback(async (text: string) => {
        setIsParsingText(true);
        setEvaluableItems([]);
        try {
            const items = await parseTextForEvaluableItems(text);
            setEvaluableItems(items);
        } catch (error) {
            console.error("Error parsing text for rubric items:", error);
            setRubricError("No se pudieron analizar los elementos evaluables del texto proporcionado.");
        } finally {
            setIsParsingText(false);
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        setIsGeneratingRubric(true);
        setGeneratedRubric(null);
        setRubricError(null);
        try {
            const allEntities = evaluableItems.flatMap(i => [i.parent, ...i.children]);
            const selectedEntities = allEntities.filter(e => selectedEvaluableItems.includes(e.temp_id));
            const itemsToGenerate = selectedEntities.map(e => ({ name: e.nombre, code: e.codigo }));

            const parentNames = new Set(evaluableItems.filter(i => selectedEvaluableItems.includes(i.parent.temp_id)).map(i => i.parent.nombre));
            setParentNamesForRubric(parentNames);

            const rubric = await generateRubric(itemsToGenerate);
            setGeneratedRubric(rubric);

            if (user) {
                const itemData: Partial<RubricHistoryItem> = {
                    subject: selectedHistoryItem?.subject || manualSubject || "N/A",
                    course: selectedHistoryItem?.course || manualCourse || "N/A",
                    region: selectedHistoryItem?.region || "N/A",
                    rubric: rubric,
                };
                const savedRubric = await saveRubricsHistory(itemData, user.uid);
                setRubricsHistory(prev => [savedRubric, ...prev]);
                addToast("Rúbrica generada y guardada.", 'success');
            }

        } catch (error) {
            console.error("Error generating rubric:", error);
            setRubricError("No se pudo generar la rúbrica.");
            addToast("Error al generar la rúbrica.", 'error');
        } finally {
            setIsGeneratingRubric(false);
        }
    }, [evaluableItems, selectedEvaluableItems, user, selectedHistoryItem, manualSubject, manualCourse, setRubricsHistory, addToast]);

    const handleReset = () => {
        setGeneratedRubric(null);
        setSelectedEvaluableItems([]);
        setEvaluableItems([]);
        setSelectedHistoryItem(null);
        setRubricError(null);
        setManualSubject('');
        setManualCourse('');
    };

    return (
        <RubricsPanel
            history={history}
            onSelectHistory={handleSelectHistory}
            selectedHistoryItem={selectedHistoryItem}
            isParsingSql={isParsingSql}
            isParsingText={isParsingText}
            onParseText={handleParseText}
            evaluableItems={evaluableItems}
            selectedItems={selectedEvaluableItems}
            onSelectedItemsChange={setSelectedEvaluableItems}
            onGenerate={handleGenerate}
            isGenerating={isGeneratingRubric}
            generatedRubric={generatedRubric}
            error={rubricError}
            // If manual input, these might be empty initially. RubricsPanel might need updates if it doesn't support manual subject/course input.
            // Looking at App.tsx, `RubricsPanel` passed `subject` and `course` from global state.
            // If we want manual input support, we might need to add inputs to RubricsPanel or handle it here if RubricsPanel supports it.
            // Assuming RubricsPanel reads these for display or context. 
            subject={selectedHistoryItem?.subject || manualSubject}
            course={selectedHistoryItem?.course || manualCourse}
            onReset={handleReset}
            parentNames={parentNamesForRubric}
        />
    );
};
