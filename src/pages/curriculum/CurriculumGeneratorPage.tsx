
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { CurriculumInput, InputTab } from '../../components/CurriculumInput';
import { CorrectionAssistant, CorrectionLog } from '../../components/CorrectionAssistant';
import { SqlDisplay } from '../../components/SqlDisplay';
import { SqlValidationDisplay } from '../../components/SqlValidationDisplay';
import { SqlCorrectionAssistant } from '../../components/SqlCorrectionAssistant';
import { WandSparklesIcon } from '../../components/icons';
import {
    streamGenerateSqlFromCurriculum,
    extractTextFromPdf, refineCurriculumText, refineSqlScript, SQL_HEADER
} from '../../services/geminiService';
import { validateSql, autoCorrectSql } from '../../services/sqlProcessor';
import { saveHistory, HistoryItem } from '../../services/historyService';

export const CurriculumGeneratorPage: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { setHistory } = useData();
    const { addToast } = useToast();

    // State
    const [subject, setSubject] = useState('');
    const [course, setCourse] = useState('');
    const [region, setRegion] = useState('');

    const [curriculumText, setCurriculumText] = useState('');
    const [inputTab, setInputTab] = useState<InputTab>('paste');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);

    const [sqlCode, setSqlCode] = useState('');
    const [sqlFileName, setSqlFileName] = useState('curriculo');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [sqlValidationErrors, setSqlValidationErrors] = useState<string[]>([]);

    const [correctionLog, setCorrectionLog] = useState<CorrectionLog[]>([]);
    const [isRefining, setIsRefining] = useState(false);

    const [sqlCorrectionLog, setSqlCorrectionLog] = useState<CorrectionLog[]>([]);
    const [isRefiningSql, setIsRefiningSql] = useState(false);

    // Initialize from location state if available (from Repository)
    useEffect(() => {
        if (location.state && location.state.historyItem) {
            const item = location.state.historyItem as HistoryItem;
            setSubject(item.subject);
            setCourse(item.course);
            setRegion(item.region);
            setSqlCode(item.sql);
            setSqlFileName(item.fileName);
            // Derive curriculumText from SQL body?
            const sqlBody = item.sql.replace(SQL_HEADER, '').trim();
            setCurriculumText(sqlBody);
            setSqlValidationErrors(validateSql(item.sql));
        }
    }, [location.state]);

    const handleExtract = useCallback(async (file: File) => {
        setIsExtracting(true);
        setExtractionError(null);
        setCurriculumText('');
        try {
            const text = await extractTextFromPdf(file, subject, course);
            setCurriculumText(text);
        } catch (error) {
            console.error("Error extracting text:", error);
            setExtractionError("No se pudo extraer el texto del PDF. Verifique que el archivo y los datos (materia, curso) son correctos.");
        } finally {
            setIsExtracting(false);
        }
    }, [subject, course]);

    const handleRefine = useCallback(async (userRequest: string) => {
        setIsRefining(true);
        setCorrectionLog(prev => [...prev, { role: 'user', content: userRequest }]);
        try {
            const refinedText = await refineCurriculumText(curriculumText, userRequest);
            setCurriculumText(refinedText);
            setCorrectionLog(prev => [...prev, { role: 'model', content: "Texto actualizado." }]);
        } catch (error) {
            console.error("Error refining text:", error);
            setCorrectionLog(prev => [...prev, { role: 'model', content: "No se pudo aplicar la corrección." }]);
        } finally {
            setIsRefining(false);
        }
    }, [curriculumText]);

    const handleGenerateSql = useCallback(async () => {
        if (!curriculumText) return;
        setIsGenerating(true);
        setSqlCode(SQL_HEADER);
        setSqlValidationErrors([]);
        setSqlCorrectionLog([]);
        setGenerationProgress(0);

        try {
            const stream = streamGenerateSqlFromCurriculum(curriculumText);
            let fullSqlBody = '';
            for await (const chunk of stream) {
                fullSqlBody += chunk;
                const cleanBodyForDisplay = fullSqlBody.replace(/^```sql\s*/, '').replace(/```\s*$/, '');
                setSqlCode(SQL_HEADER + '\n' + cleanBodyForDisplay);
                setGenerationProgress(prev => Math.min(99, prev + 2));
            }

            const cleanedSqlBody = fullSqlBody.replace(/^```sql\s*/, '').replace(/```\s*$/, '').trim();
            const correctedSqlBody = autoCorrectSql(cleanedSqlBody);
            const finalSql = SQL_HEADER + '\n' + correctedSqlBody;
            setSqlCode(finalSql);
            setSqlValidationErrors(validateSql(finalSql));

            const fileNameMatch = correctedSqlBody.match(/INSERT INTO entidades \(tipo, codigo, nombre, traza_evalua, temp_id\) VALUES\s*\(0, '[^']+', '([^']+)'/);
            const finalFileName = fileNameMatch ? fileNameMatch[1].replace(/\s+/g, '_') : 'curriculo';
            setSqlFileName(finalFileName);

            if (user) {
                const newItem: Omit<HistoryItem, 'id' | 'createdAt'> = {
                    subject,
                    course,
                    region,
                    sql: finalSql,
                    fileName: finalFileName,
                };
                const savedItem = await saveHistory(newItem, user.uid);
                setHistory(prev => [savedItem, ...prev]);
                addToast("Script SQL generado y guardado.", 'success');
            }

        } catch (error) {
            console.error("Error generating SQL:", error);
            addToast("Error al generar el script SQL.", 'error');
        } finally {
            setIsGenerating(false);
            setGenerationProgress(100);
        }
    }, [curriculumText, user, subject, course, region, setHistory, addToast]);

    const handleRefineSql = useCallback(async (userRequest: string) => {
        setIsRefiningSql(true);
        setSqlCorrectionLog(prev => [...prev, { role: 'user', content: userRequest }]);
        try {
            const sqlBody = sqlCode.replace(SQL_HEADER, '').trim();
            const refinedSqlBody = await refineSqlScript(sqlBody, userRequest);
            const finalSql = SQL_HEADER + '\n' + autoCorrectSql(refinedSqlBody);
            setSqlCode(finalSql);
            setSqlValidationErrors(validateSql(finalSql));
            setSqlCorrectionLog(prev => [...prev, { role: 'model', content: "Script SQL actualizado." }]);
        } catch (error) {
            console.error("Error refining SQL:", error);
            setSqlCorrectionLog(prev => [...prev, { role: 'model', content: "No se pudo aplicar la corrección." }]);
        } finally {
            setIsRefiningSql(false);
        }
    }, [sqlCode]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-100">Paso 1: Proporcione los datos</h2>
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1">Materia</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej: Sistemas Informáticos" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="course" className="block text-sm font-medium text-gray-400 mb-1">Curso</label>
                            <input type="text" id="course" value={course} onChange={e => setCourse(e.target.value)} placeholder="Ej: 1ASIR" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-400 mb-1">Comunidad Autónoma</label>
                            <input type="text" id="region" value={region} onChange={e => setRegion(e.target.value)} placeholder="Ej: Castilla La Mancha" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                        </div>
                    </div>
                </div>

                <CurriculumInput
                    curriculumText={curriculumText}
                    onCurriculumTextChange={setCurriculumText}
                    onExtract={handleExtract}
                    isExtracting={isExtracting}
                    extractionError={extractionError}
                    subject={subject}
                    course={course}
                    activeTab={inputTab}
                    onTabChange={setInputTab}
                />
                <CorrectionAssistant
                    onRefine={handleRefine}
                    log={correctionLog}
                    isRefining={isRefining}
                    isEnabled={!!curriculumText.trim()}
                />
                <button
                    onClick={handleGenerateSql}
                    disabled={isGenerating || !curriculumText.trim()}
                    className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <WandSparklesIcon className="w-5 h-5" />
                    Generar Script
                </button>
            </div>
            <div className="space-y-4">
                <SqlValidationDisplay errors={sqlValidationErrors} />
                <SqlDisplay sqlCode={sqlCode} isLoading={isGenerating} fileName={sqlFileName} progress={generationProgress} />
                <SqlCorrectionAssistant
                    onRefine={handleRefineSql}
                    log={sqlCorrectionLog}
                    isRefining={isRefiningSql}
                    isEnabled={!!sqlCode.trim()}
                />
            </div>
        </div>
    );
};
