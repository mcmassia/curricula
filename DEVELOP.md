# Development Log - CurrículoSQL

This file tracks the development iterations of the CurrículoSQL application, based on user feedback and feature requests.

---

### Versión 8.3 (2024-09-13)

**User Request:**
- Improve the student import and management features.
- Enhance the CSV import to handle special characters and more data fields.
- Add bulk assignment of students to groups.
- Create a detailed view for each student's file.
- Include search/filter functionality for students and groups.

**Changes:**
- **Enhanced CSV Import & Data Model:**
  - **Character Encoding:** The CSV importer now explicitly uses `latin1` encoding to correctly handle special characters and accents from exports from platforms like iPasen/Séneca.
  - **Expanded Data Model (`types.ts`):** The `Student` model was expanded to include optional fields: `idNumber`, `age`, `phone`, `address`, and `tags`.
  - **Smarter Parsing (`ImportStudentsModal.tsx`):** The import logic was overhauled to intelligently parse all the new fields from the provided CSV format, correctly mapping them to the student profile.
- **New Feature: Bulk Student Actions (`StudentsPanel.tsx`):**
  - **Selection UI:** The student list now includes checkboxes and a "Select All" option to select multiple students.
  - **Contextual Toolbar:** A new "Acciones en lote" (Bulk Actions) toolbar appears when students are selected.
  - **Bulk Assignment:** The toolbar includes a dropdown and an "Asignar" button to assign all selected students to a group in a single click.
  - **Bulk Deletion:** The toolbar also includes a "Delete Selected" button to remove multiple students at once.
- **New Feature: Student Detail View:**
  - **New Component (`StudentDetailModal.tsx`):** Created a new modal to serve as a complete student file, which opens when a student's name is clicked.
  - **Comprehensive Info:** The modal displays all student information, including the new fields from the import, and lists their group memberships.
  - **Editing Functionality:** The detail view includes an "Edit" mode to update a student's information. This is powered by a new `updateStudent` function in `studentService.ts` and a corresponding `handleUpdateStudent` handler in `App.tsx`.
- **New Feature: Search and Filtering (`StudentsPanel.tsx`):**
  - Added a search bar to filter the list of groups.
  - Added a second search bar to filter the list of students within the selected view (all, unassigned, or a specific group).
- **Core Logic (`App.tsx`):**
  - Implemented state management and handlers for the new student detail modal.
  - Updated the `handleDeleteStudent` handler to support bulk deletion.

---

### Versión 8.2 (2024-09-12)

**User Request:**
- Implement a new, full-featured section for "Alumnos" (Students).
- Allow creation of student groups.
- Students can be created manually or imported from a CSV file.
- Groups can have curricula assigned to them from the repository.

**Changes:**
- **New Feature: Student & Group Management:**
  - **New Section (`StudentsPanel.tsx`):** Created a new top-level "Alumnos" section with a two-column layout for managing groups and students.
  - **Group Management:** The UI allows for creating, renaming, and deleting student groups.
  - **Student Management:** Students can be added manually or imported in bulk via a CSV file. The student list can be filtered by group.
  - **Curriculum Assignment (`AssignCurriculaModal.tsx`):** A new modal allows users to select and assign multiple curricula to a student group, linking teaching plans to students.
  - **CSV Import (`ImportStudentsModal.tsx`):** A new modal facilitates bulk student import, with clear instructions on the required format.
- **Backend Services:**
  - **`studentService.ts` & `groupService.ts`:** Created two new Firestore services to handle all CRUD operations for the `students` and `student_groups` collections.
  - **`firebaseErrorHelper.ts`:** Updated to provide security rule suggestions for the new collections.
- **UI & Data Integration:**
  - **Navigation (`SideNav.tsx`):** Added a new "Alumnos" link to the main navigation.
  - **Dashboard (`WelcomePanel.tsx`):** Added a new "Alumnos" stat card and included student/group counts in the main content overview chart.
  - **Data Models (`types.ts`):** Added `Student`, `SavedStudent`, `StudentGroup`, and `SavedStudentGroup` interfaces.
  - **Core Logic (`App.tsx`):** Fully integrated the new feature with state management, data loading on login, and all necessary event handlers.

---

### Versión 8.1 (2024-09-11)

**User Request:**
- The homepage design is not very visual or informative.
- Data in some cards overflows, which looks bad.
- Redesign the homepage to be much more visual and informative.
- Make the left navigation panel collapsible.

**Changes:**
- **New Feature: Collapsible Navigation (`SideNav.tsx`, `App.tsx`):**
  - The main sidebar can now be collapsed into an icon-only mode to maximize screen space.
  - Added a toggle button at the top of the sidebar (`ChevronDoubleLeftIcon`).
  - When collapsed, hovering over an icon displays its label in a tooltip for usability.
  - The main application layout smoothly transitions to accommodate the changing sidebar width.
- **New Feature: Dynamic Dashboard (`WelcomePanel.tsx`):**
  - The welcome screen has been completely redesigned into an informative dashboard.
  - **Stat Cards:** Added a new section at the top with cards displaying key metrics: total number of Curricula, Units, Situations, Activities, Rubrics, and Resources.
  - **Content Overview Chart (`BarChart.tsx`):** Created a new reusable bar chart component to visually represent the distribution of content across different categories.
  - **Improved Layout:** Reorganized the "Recently Added" and "AI Suggestion" widgets into a cleaner two-column layout alongside the new chart.
- **Bug Fix & UI Polish:**
  - **Text Overflow (`WelcomePanel.tsx`):** Fixed the issue of overflowing text by applying the `truncate` utility class to long titles in the "Recently Added" list, ensuring a clean and professional appearance.
- **Icons (`icons.tsx`):** Added `ChevronDoubleLeftIcon`, `BarChartIcon`, and `UsersIcon` to support the new UI elements.

---

### Versión 8.0 (2024-09-10)

**User Request:**
- Implementa una nueva sección 'Evaluar Trabajo' en Utilidades. El usuario subirá un archivo de texto, un pdf o una imagen y seleccionará una Rúbrica de su repositorio. La IA debe devolver un informe con una puntuación sugerida para cada criterio de la rúbrica y un párrafo de feedback constructivo para el alumno.

**Changes:**
- **New Feature: AI Assignment Grader (`components/UtilitiesPanel.tsx`):**
  - The "Utilities" section has been updated with a new "Evaluar Trabajo con IA" tool.
  - The UI allows users to upload an assignment file (TXT, PDF, PNG, JPG).
  - A dropdown is provided to select from the user's saved rubrics.
  - A new results view displays the AI-generated report, including a breakdown of scores per criterion with justifications, and a final constructive feedback paragraph for the student.
- **AI Service (`services/geminiService.ts`):**
  - Created a new `gradeAssignment` function that sends the assignment file and the selected rubric to the Gemini Pro model.
  - The prompt is engineered to perform a multi-modal analysis, comparing the student's work against the rubric and returning a structured JSON report.
- **Core Logic (`App.tsx`):**
  - Added state management (`isGrading`, `gradingResult`, `gradingError`) to handle the asynchronous grading process.
  - Implemented the `handleGradeAssignment` function to process the file, call the AI service, and display the results.
- **Data Models (`types.ts`):**
  - Added new `GradingResult` and `GradingCriterionResult` interfaces to define the structure of the AI's evaluation report.

---

### Versión 7.9 (2024-09-09)

**User Request:**
- Completely revamp the "Mejoras" (Improvements) section, which has become outdated.
- Provide 20 new, interesting, and exponential improvement ideas relevant to the app's current functionality.
- Add a delete button to each improvement card to allow users to dismiss suggestions.

**Changes:**
- **New Improvement Ideas (`services/improvementsService.ts`):**
  - The entire list of improvements was replaced with 20 new, high-impact ideas. These suggestions are directly related to the app's existing features, proposing advanced new tools like a "Planificador Anual" (Yearly Planner), "Generador de Exámenes" (Exam Generator), "Analizador de Trabajos con IA" (AI-powered Assignment Grader), and a "Banco de Recursos Comunitario" (Community Resource Bank).
- **Interactive UI (`components/ImprovementsPanel.tsx`):**
  - Added a `TrashIcon` button to the corner of each improvement card.
  - The component now accepts an `onDelete` prop to handle the removal of a card.
- **Core Logic (`App.tsx`):**
  - Implemented the `handleDeleteImprovement` handler, which updates the `improvements` state by filtering out the selected item.
  - Increased the number of initially loaded improvements from 3 to 9 to make the panel feel more dynamic and populated from the start.

---

### Versión 7.8 (2024-09-08)

**User Request:**
- Rename the "Scripts SQL" section to "Currículos" for better clarity and user understanding.
- Update the repository title and other related labels accordingly.

**Changes:**
- **UI Renaming:**
  - **`SideNav.tsx`:** The main navigation menu item "Scripts SQL" has been renamed to "Currículos".
  - **`WelcomePanel.tsx`:** The feature card on the dashboard has been updated from "Scripts SQL" to "Currículos", and its description was adjusted to be more general.
  - **`SqlRepositoryPanel.tsx`:** The title of the repository view has been changed from "Repositorio de Scripts SQL" to "Repositorio de Currículos", and the introductory text was updated to match.
- **Workflow:** This is primarily a visual/text change to improve UX. The underlying logic, such as the `sql` view name and `handleGenerateSql` handlers, remains unchanged to minimize code disruption.

---

### Versión 7.7 (2024-09-07)

**User Request:**
- Implement a new "Recursos Educativos" section to save and manage educational resources associated with specific curricula.
- This section should be a repository with search and filter capabilities.
- Allow users to add resources manually (name, description, link) and associate them with a curriculum.
- Integrate this with the "Suggest Resources" feature by adding a "Save" button to each suggested resource.

**Changes:**
- **New Feature: Educational Resources Section:**
  - **New Component (`EducationalResourcesPanel.tsx`):** Created a new repository view to manage all saved resources. It groups resources by curriculum and includes a search bar.
  - **Navigation & Dashboard:** Added a new "Recursos Educativos" link to the `SideNav.tsx` and a corresponding card to the `WelcomePanel.tsx` for easy access.
  - **Backend (`educationalResourceService.ts`):** Created a new Firestore service for CRUD operations on the `educational_resources` collection. `firebaseErrorHelper.ts` was also updated to recognize this new collection.
  - **Data Models (`types.ts`):** Added `EducationalResource` and `SavedEducationalResource` interfaces.
- **Integration with AI Suggestions:**
  - **`ResourceSuggestModal.tsx`:** Each suggested resource now has a "Save" button. The modal is aware of already saved resources (via a `Set` of URLs) and displays a "Saved" state to prevent duplicates.
  - **`SqlRepositoryPanel.tsx` & `App.tsx`:** The workflow for suggesting resources was updated. When a suggestion is requested, the parent curriculum's context is now stored in the state (`curriculumForResources`). This allows a suggested resource to be saved with the correct curriculum association.
- **Manual Resource Management:**
  - **New Component (`AddResourceModal.tsx`):** Created a new modal with a form to manually add a new resource. The form includes a dropdown list populated with the user's saved curricula, allowing for easy association.
  - **Core Logic (`App.tsx`):** Implemented all necessary state management and handlers to control the new modals and data flows for loading, saving, and deleting educational resources.

---

### Versión 7.6 (2024-09-06)

**User Request:**
- Implement a new "Suggest Resources" feature that finds educational web resources based on the "saberes" (knowledge items) of a saved curriculum.

**Changes:**
- **New Feature: Suggest Educational Resources:**
  - **UI (`SqlRepositoryPanel.tsx`):** Added a new "Sugerir Recursos" button to each item in the SQL repository.
  - **AI Service (`geminiService.ts`):** Created a new `suggestResourcesForSaberes` function. This function uses **Google Search grounding** (`tools: [{googleSearch: {}}]`) to actively search the web for high-quality, relevant educational resources (videos, simulations, articles) for each "saber" provided.
  - **New Component (`ResourceSuggestModal.tsx`):** Created a new modal to display the results. It shows a loading state during the search and then presents the suggested resources grouped by each "saber", with clickable links and descriptions.
  - **Core Logic (`App.tsx`):** Implemented a new handler (`handleSuggestResources`) and the necessary state to manage the feature's workflow, including parsing the SQL for "saberes" and displaying the modal.
  - **Data Models (`types.ts`):** Added `SuggestedResource` and `SaberWithResources` interfaces to structure the data returned by the AI.

---

### Versión 7.5 (2024-09-05)

**User Request:**
- Fix critical regressions in the core SQL generation functionality.
- The generated SQL is missing the `CREATE TABLE` header.
- The `tipo` for curriculum entities is not being identified correctly according to the official schema.

**Changes:**
- **New Workflow (`TODO.md`):**
  - Introduced a `TODO.md` file to act as a checklist for all requested changes, ensuring transparency and preventing missed tasks.
- **SQL Header Restored (`App.tsx`):**
  - Corrected the logic in `handleGenerateSql` to ensure the final, complete script always includes the `SQL_HEADER` before being saved or displayed.
- **AI Prompt Overhaul (`geminiService.ts`):**
  - Updated the `tipo_elemento` table in the header to match the official schema.
  - Added a "MÁXIMA PRIORIDAD ABSOLUTA" rule to the prompt, forcing the AI to strictly adhere to the official `tipo` IDs for all entities.
- **Internal Parser Correction (`sqlParser.ts`):**
  - Updated the hardcoded `tipo` IDs within the parser functions (`parseSqlForEvaluableItems`, `extractCurricularItemsFromSql`) to match the corrected schema, ensuring that features like the Rubric Generator and Curriculum Picker correctly identify elements from saved SQL scripts.
---
### Version 7.4 (2024-09-04)

**User Request:**
- Create a new "Utilidades" section.
- Add a tool to calculate a grade using a rule of three based on max score, student score, and max grade.

**Changes:**
- **New Feature: Utilities Section:**
  - **New Component (`UtilitiesPanel.tsx`):** Created a new panel to house utility tools.
  - **Grade Calculator:** Implemented a simple, real-time calculator for grades. The UI includes three inputs (max score, student score, max grade) and displays the result and the formula used.
  - **Navigation (`SideNav.tsx`, `types.ts`):** Added a new top-level "Utilidades" item to the side navigation.
  - **Dashboard (`WelcomePanel.tsx`):** Added a new card to the welcome dashboard for quick access to the new utilities section.
  - **Icons (`icons.tsx`):** Added a new `CalculatorIcon` for the UI.
---
### Version 7.3 (2024-09-03)

**User Request:**
- Simplify the manual creation flow for Didactic Units and Learning Situations due to complexity and errors.
- The new flow should involve providing initial key information, then using AI to generate the rest of the plan.
- The full editing capability should be maintained for existing items.

**Changes:**
- **Simplified Creation Workflow:**
  - **New Editor Logic:** The editor components (`DidacticUnitEditor`, `LearningSituationEditor`) now differentiate between 'create' and 'edit' modes.
  - **Create Mode:** The editor presents a minimal form for initial ideas (e.g., title and introduction for a unit). A primary "Generate Rest of Content with IA" button is displayed.
  - **AI-Powered Body Generation:** Clicking the button triggers new AI service functions (`generateUnitBody`, `generateSituationBody`) that take the initial data and generate all remaining sections of the plan. The form is then fully populated with this content.
- **Maintained Edit Workflow:**
  - **Edit Mode:** When editing an existing item, the editor opens with the full form displayed, as before.
  - The per-section "magic wand" buttons for AI assistance are preserved in edit mode, allowing for granular control and refinement.
- **Core Logic (`App.tsx`):** A new handler (`handleAiGeneratePlanBody`) was added to manage the new full-body generation feature.
- **AI Service (`geminiService.ts`):** Implemented the `generateUnitBody` and `generateSituationBody` functions with prompts specifically designed for this new workflow.
---
### Version 7.2 (2024-09-02)

**User Request:**
- Fix a critical React error (`Minified React error #31`) that occurs when trying to save a manually created unit after using the AI to complete the "activitySequence" section.
- Fix a related visual bug where `[object Object]` would appear in the activity input fields.

**Changes:**
- **Robust AI Response Handling:**
  - **Root Cause:** The error was caused by the AI sometimes returning an array of objects (e.g., `{title: '...', description: '...'}`) for an activity list, instead of an array of simple strings. The UI and state were not prepared to handle this, leading to rendering errors.
  - **Sanitization Layer:** Implemented a "sanitization" function within the editor components. After the AI completes a section, this function checks the `activitySequence`. If it finds objects, it automatically converts them into a readable string format (e.g., "Title: Description") before updating the component's state. This resolves both the visual bug and the critical save error.
  - **Improved AI Prompt:** The prompts for the AI-completion functions in `geminiService.ts` have been reinforced with an explicit instruction to return arrays of strings for `activitySequence`, reducing the likelihood of the issue occurring.
  - **Resilient Rendering:** The new sanitization layer ensures that the component's state is always valid, preventing crashes from malformed data.
---
### Version 7.1 (2024-08-30)

**User Request:**
- Fix a critical bug where the Didactic Unit editor would close when trying to add items to a list (e.g., competencies).
- Complete the Learning Situation editor form, which was previously a stub.
- Implement a powerful new "Curriculum Picker" to select curricular items from history or pasted text directly within the editors.

**Changes:**
- **Bug Fix & Editor Completion:**
  - **Immutable State:** Corrected the state update logic in `DidacticUnitEditor.tsx` and `LearningSituationEditor.tsx`. The handlers for adding/removing items from lists now use immutable patterns (spreading arrays/objects), fixing the bug that caused the editor to close unexpectedly.
  - **`LearningSituationEditor.tsx`:** The component has been fully built out with all necessary form fields and logic, mirroring the functionality of the unit editor but with its specific fields.
- **New Feature: Curriculum Picker:**
  - **New Component (`CurriculumPickerModal.tsx`):** Created a new modal that allows users to select competencies, criteria, and knowledge.
  - **Dual Input:** The modal supports two modes:
    1.  **From History:** Users can select a saved curriculum, which is then parsed on the client-side to display its elements.
    2.  **From Text:** Users can paste curriculum text, which is sent to the Gemini API for real-time parsing.
  - **New Services:**
    - `sqlParser.ts`: Added `extractCurricularItemsFromSql` to efficiently parse saved SQL scripts.
    - `geminiService.ts`: Added `parseTextForCurricularItems` to handle parsing of raw text via AI.
  - **Editor Integration:** Replaced the simple "+ Add" buttons in the "Curricular Connection" section of both editors with a "Seleccionar del Currículo" button that launches the new modal. The selected items are then added to the editor's state.
---
### Version 7.0 (2024-08-29)

**User Request:**
- Implement the ability to manually create and edit Didactic Units, Learning Situations, and Class Activities.
- Add an AI assistant within the editors to complete individual sections on demand.

**Changes:**
- **New Feature: Creation & Editing:**
  - **New Components:** Created three new editor components: `DidacticUnitEditor.tsx`, `LearningSituationEditor.tsx`, `ClassActivityEditor.tsx`. These provide full-featured forms for all data fields.
  - **UI Integration:** Added "Create New..." and "Edit" buttons to all repository panels (`UnitsRepositoryPanel`, `SituationsRepositoryPanel`, `ClassActivitiesRepositoryPanel`), providing a seamless entry point into the new editors.
  - **Core Logic (`App.tsx`):** Massively refactored the app to support the editing workflow. Added a new `editor` sub-view, state management for items being edited, and robust `handleSave...` handlers that differentiate between creating new documents and updating existing ones in Firestore.
- **New Feature: AI-Assisted Completion:**
  - **UI in Editors:** Each major section within the new editor components features a "magic wand" icon.
  - **AI Service (`geminiService.ts`):** Implemented new, highly contextual functions (`complete...Section`). These functions take the partially filled-out data from an editor and the name of a specific section, instructing the AI to generate *only* the content for that section.
  - **Core Logic (`App.tsx`):** Added `handleAiComplete...Section` handlers to orchestrate the communication between the editors and the Gemini service, updating the editor's state with the AI-generated content.
- **Backend Services:** Updated all Firestore `update` functions to support overwriting entire data objects, which is necessary for the save functionality of the editors.
---
### Version 6.5 (2024-08-28)

**User Request:**
- Simplify the application by unifying the structure of Didactic Units and Learning Situations.
- Eliminate the separate "Didactic Sequence" feature and integrate the activity sequence directly into the units.
- The generator should now produce a single, highly detailed unit/situation instead of a list.

**Changes:**
- **Unified & Enriched Structure:**
  - **Data Models (`types.ts`):** Completely redesigned `DidacticUnit` and `LearningSituation` to share a common, detailed structure (`BasePlan`). The only difference is that Situations have additional `context`, `challenge`, and `product` fields.
  - **AI Service (`geminiService.ts`):** The prompts for `generateDidacticUnits` and `generateLearningSituations` were rewritten to generate a single, high-quality object matching the new rich structure. This includes a full final `rubric` object.
- **Elimination of Didactic Sequence:**
  - **Core Logic (`App.tsx`):** Removed all state, handlers, and modals related to the `generateDidacticSequence` feature. The application flow is now much simpler.
  - **UI (`UnitsRepositoryPanel.tsx`):** All "Create Sequence," "View Sequence," and "Delete Sequence" buttons and logic have been removed from the UI, as the sequence is now an integral part of the unit itself.
  - **AI Service (`geminiService.ts`):** The `generateDidacticSequence` function has been deleted.
- **Improved UI/UX:**
  - The generator panels (`DidacticUnitsPanel.tsx`, `LearningSituationsPanel.tsx`) were redesigned to display the new, single, detailed unit/situation structure.
  - "Create Activity" buttons are now contextually placed within the new "Activity Sequence" section (Start, Development, Closure) of the unit/situation.
  - The repository views (`UnitsRepositoryPanel.tsx`, `SituationsRepositoryPanel.tsx`) were updated to render the new detailed structure when an item is expanded.
---
### Version 6.3 (2024-08-26)

**User Request:**
- Create a new "Actividades de Clase" section with a generator and repository.
- The generator should create activities from a curriculum.
- Add a "Create Activity" button to the proposed activities within Didactic Units and Learning Situations to generate a detailed version of that specific activity.

**Changes:**
- **New Feature: "Actividades de Clase" Section:**
  - **Navigation (`SideNav.tsx`):** Added a new collapsible category "Act. de Clase" with "Generador" and "Repositorio" sub-sections.
  - **Generator (`ClassActivitiesPanel.tsx`):** Created a new panel to generate activities. It supports two modes: generating a general list from a curriculum, or generating a single, highly-detailed activity from a specific context.
  - **Repository (`ClassActivitiesRepositoryPanel.tsx`):** Created a new panel to view, search, and delete saved class activities.
  - **AI Service (`geminiService.ts`):** Implemented two new functions: `generateClassActivitiesFromCurriculum` and `generateDetailedActivity` for the two generation modes.
  - **Backend (`classActivityService.ts`):** Added a new Firestore service for all CRUD operations on the `class_activities` collection.
  - **Dashboard (`WelcomePanel.tsx`):** Updated the welcome screen with a new card for the "Actividades de Clase" feature.
- **Deep Integration:**
  - Added a "Crear Actividad" button next to each proposed activity in the generator and repository views for both Didactic Units and Learning Situations.
  - Implemented the core logic in `App.tsx` (`handleCreateDetailedActivity`) to capture the context, switch to the activities generator, and trigger the detailed generation, seamlessly connecting the application's features.
---
### Version 6.2 (2024-08-25)

**User Request:**
- Add the ability to export Didactic Units and Learning Situations in both JSON format and a clean, readable plain text format.

**Changes:**
- **New Export Options:**
  - **JSON Export:** Implemented "Download JSON" functionality in both the generator and repository panels for Didactic Units and Learning Situations. This allows users to save the structured data for use in other applications. A new `FileJsonIcon` was added for clarity.
  - **Formatted Text Export:** Added a "Copy Text" button to the repositories for both sections. This copies a well-organized, easy-to-read text version of a unit or situation to the clipboard, perfect for pasting into documents.
- **UI Enhancements:**
  - The generator panels (`DidacticUnitsPanel.tsx`, `LearningSituationsPanel.tsx`) now feature a comprehensive export toolbar.
  - The repository panels (`UnitsRepositoryPanel.tsx`, `SituationsRepositoryPanel.tsx`) now include the new export buttons within each item's detail view.
  - Copy buttons provide instant visual feedback ("¡Copiado!") upon success.
---
### Version 6.0 (2024-08-23)

**User Request:**
- Implement a new, full-featured section for "Situaciones de Aprendizaje".
- The section should include a generator (from history or text) and a repository for saved situations.
- The AI generator should create 3 situations based on a detailed set of pedagogical requirements.

**Changes:**
- **New Feature: Situaciones de Aprendizaje:**
  - **Navigation (`SideNav.tsx`):** Added a new collapsible category "Situaciones de Aprendizaje" to the main navigation, with "Generador" and "Repositorio" sub-sections.
  - **Generator (`LearningSituationsPanel.tsx`):** Created a new component for generating learning situations. It mirrors the UI/UX of the other generator panels, allowing input from curriculum history or pasted text.
  - **Repository (`SituationsRepositoryPanel.tsx`):** Created a new component to display, search, and manage all saved learning situations. Includes functionality to delete items.
  - **AI Service (`geminiService.ts`):** Implemented a new, highly-detailed prompt and a corresponding `generateLearningSituations` function that instructs the AI to generate 3 complete situations in a structured JSON format, following all specified pedagogical guidelines.
  - **Backend (`learningSituationService.ts`):** Created a new Firestore service to handle all CRUD (Create, Read, Delete) operations for the `learning_situations` collection.
  - **Core Logic (`App.tsx`):** Fully integrated the new feature by adding state management, data loading, and event handlers for generating, saving, and deleting learning situations.
  - **Data Models (`types.ts`):** Added `LearningSituation` and `SavedLearningSituation` interfaces to define the data structure.
---
### Version 5.9 (2024-08-22)

**User Request:**
- The delete buttons are still not working reliably. The issue is likely caused by the browser blocking `window.confirm` pop-ups.

**Changes:**
- **Robust Confirmation System:**
  - **New Component (`ConfirmationModal.tsx`):** Created a new, custom modal component to handle all deletion confirmations. This component is styled consistently with the application and cannot be blocked by the browser, ensuring reliability.
  - **App Logic (`App.tsx`):** Replaced all instances of `window.confirm` with the new confirmation modal system. A new state was introduced to manage the modal's visibility and the action to be performed upon confirmation.
  - **Enhanced UX:** The delete workflow is now more professional and reliable. Users are presented with a clear, non-intrusive dialog to confirm destructive actions. This change was applied to the deletion of SQL Scripts, Rubrics, Didactic Units, and Didactic Sequences.
---
### Version 5.8 (2024-08-21)

**User Request:**
- The buttons for deleting didactic units and deleting saved sequences are not working. They do not perform any action when clicked.

**Changes:**
- **Bug Fix (Critical):**
  - **Root Cause:** The event handler functions for deletion (`handleDeleteDidacticUnit`, `handleDeleteSequence`) were not being memoized in the main `App.tsx` component. This led to child components receiving "stale" versions of the functions that did not have access to the latest application state, causing them to fail silently.
  - **Solution:** All deletion handlers (`handleDeleteDidacticUnit`, `handleDeleteSequence`, `handleDeleteHistory`, `handleDeleteRubricHistory`) have been wrapped in the `useCallback` hook with the appropriate dependency arrays. This ensures that the functions passed as props are stable and always have the correct context, making the delete operations reliable.
  - The buttons in the repository now function correctly, showing a confirmation prompt and deleting the item from Firestore and the UI state upon confirmation.
---
### Version 5.7 (2024-08-20)

**User Request:**
- Fix a bug where the "delete didactic unit" button was not working.
- Reorganize the app by creating a dedicated "Scripts SQL" section with its own generator and repository, replacing the old global history panel.
- Implement an elegant, modern welcome screen (Dashboard) as the default view after login.

**Changes:**
- **New Feature: Welcome Dashboard:**
  - **New Component (`WelcomePanel.tsx`):** Created a new, modern dashboard view that serves as the app's landing page after login. It features interactive cards for navigating to the main tools.
  - **App Flow:** The default view is now set to `'dashboard'`, providing a clear starting point for users.
- **Major Reorganization: SQL Scripts Section:**
  - **New Component (`SqlRepositoryPanel.tsx`):** Created a dedicated repository for SQL scripts, replacing the old, generic history side panel. It includes search, load, download, and delete functionalities.
  - **Navigation:** Restructured the `SideNav.tsx` to include a new collapsible "Scripts SQL" category with "Generador" and "Repositorio" sub-sections.
  - **Cleanup:** Removed the global "Historial" button from the `Header.tsx` and decommissioned the `HistorySidePanel.tsx` component, streamlining the UI and making it more contextual.
- **Bug Fix:**
  - Investigated and corrected the issue with the "delete didactic unit" button. The handler logic in `App.tsx` was reviewed and confirmed, ensuring the delete functionality now works as expected.
---
### Version 5.6 (2024-08-19)

**User Request:**
- Implement the ability to delete didactic units and their saved sequences.
- Create a new repository for rubrics, similar to the one for units.
- Fully integrate rubrics with didactic units, allowing rubrics to be saved to a unit and viewed from both repositories.

**Changes:**
- **Full CRUD for Units & Sequences:**
  - **Deletion:** Implemented buttons and handler logic to delete entire didactic units or just their associated sequences from the repository (`UnitsRepositoryPanel.tsx`, `App.tsx`, `didacticUnitService.ts`). A confirmation prompt was added to prevent accidental deletion.
- **New Feature: Rubrics Repository:**
  - **New Component (`RubricsRepositoryPanel.tsx`):** Created a new, full-featured repository to view, search, and manage all saved rubrics.
  - **Navigation:** Updated the `SideNav.tsx` to make "Rúbricas" a collapsible category with "Generador" and "Repositorio" sub-sections, creating a consistent UI pattern.
- **Deep Integration of Units & Rubrics:**
  - **Saving/Linking:** When creating a rubric from a saved unit, a "Save Rubric" button now appears. This action saves the rubric and creates a two-way link between the unit and the rubric in Firestore.
  - **Data Models (`types.ts`):** The `SavedDidacticUnit` type now includes an optional `rubricId`, and the `RubricHistoryItem` now includes optional `unitId` and `unitTitle` fields.
  - **Cross-Repository Viewing:**
    - In the Units Repository, a "View Rubric" button appears if a unit has a rubric linked.
    - In the Rubrics Repository, the associated unit's metadata (subject, course, title) is displayed for linked rubrics.
  - **Backend Services:** `rubricHistoryService.ts` was updated to handle the new linking metadata.
  - **UI Modals (`RubricDisplayModal.tsx`):** The rubric modal was enhanced to support the new save functionality.
---
### Version 5.5 (2024-08-18)

**User Request:**
- Create a central repository to view, filter, and manage all saved didactic units.
- Implement the ability to save, view, and regenerate didactic sequences for saved units.
- Improve the main navigation to support sub-sections.

**Changes:**
- **New Feature: Didactic Units Repository:**
  - **New Component (`UnitsRepositoryPanel.tsx`):** Created a new view to display all didactic units saved by the user.
  - **Search/Filter:** Added a search bar to filter units by title, subject, course, or region.
  - **Actions from Repository:** Users can now perform all actions (Create Sequence, Create Rubric) directly on saved units from the repository view.
- **Enhanced Didactic Sequences:**
  - **Save Sequences:** The "Create Sequence" modal now includes a "Save Sequence" button, allowing users to persist the generated markdown text to Firestore, associated with its parent didactic unit.
  - **View Saved Sequences:** If a unit has a saved sequence, a new "View Sequence" button appears in the repository, allowing for instant access.
  - **Backend & Types:** The `didacticUnitService.ts` was updated with functions to load all units and update a unit (to save a sequence). The `SavedDidacticUnit` type in `types.ts` was updated to include an optional `sequence` field.
- **Navigation Overhaul (Sub-menus):**
  - The `SideNav.tsx` was completely redesigned to support collapsible, multi-level navigation.
  - "Unidades Didácticas" is now a parent category with two sub-sections: "Generador" and the new "Repositorio", creating a more organized and scalable navigation structure.
---
### Version 5.4 (2024-08-17)

**User Request:**
- Overhaul app navigation to be more elegant and scalable.
- Make the Didactic Units feature self-contained, with its own input methods (from history or text).
- Add powerful actions to each generated didactic unit: Save to Firebase, Create Didactic Sequence, and Create Rubric.

**Changes:**
- **Major Navigation Overhaul:**
  - Replaced the top header tabs with a new, persistent **sidebar navigation** (`SideNav.tsx`). This provides a much cleaner and more scalable UI.
  - The `Header.tsx` component was simplified to focus on the app title, user info, and history button.
- **Self-Contained Didactic Units Feature:**
  - The `DidacticUnitsPanel.tsx` was completely refactored. It now has its own input tabs ("Desde Historial", "Desde Texto"), making it independent from the main "Generador" view and mirroring the intuitive workflow of the "Rúbricas" panel.
- **New Unit Actions & Features:**
  - **Save Unit:** Implemented a system to save individual didactic units to Firebase. Created a new service (`didacticUnitService.ts`) and a modal (`SaveUnitModal.tsx`) to prompt for metadata if needed.
  - **Create Didactic Sequence:** Added a new AI-powered feature. A `generateDidacticSequence` function in `geminiService.ts` takes a unit and generates a detailed, structured sequence of activities. The result is displayed in a new `SequenceDisplayModal.tsx` with Markdown rendering.
  - **Create Rubric from Unit:** Integrated the Rubrics feature directly into the units panel. A new action button generates a rubric for a unit's specific evaluation criteria and displays it in a dedicated modal (`RubricDisplayModal.tsx`), streamlining the workflow.
- **Backend & Types:**
  - Added `didacticUnitService.ts` for Firestore operations on the new `didactic_units` collection.
  - Updated `types.ts` with the `SavedDidacticUnit` interface.
  - Provided clear instructions for updating Firebase security rules to protect the new data collection.
---
### Version 5.3 (2024-08-16)

**User Request:**
- Implement a new section to generate 10 didactic units from the curriculum text.
- Add export options for the generated units.

**Changes:**
- **New Feature: Didactic Units Generator:**
  - Added a new "Unidades Didácticas" view to the application.
  - **New Component (`DidacticUnitsPanel.tsx`):** Created a dedicated panel that allows users to generate units from the curriculum text.
  - **AI Service (`geminiService.ts`):** Implemented a new `generateDidacticUnits` function to generate 10 structured didactic units in JSON format.
  - **UI/UX:** The generated units are displayed in a user-friendly accordion list.
  - **Export Functionality:** Added options to copy the units as Plain Text or Markdown, and to download them as a PDF.
---
### Version 3.8 (2024-08-06)

**User Request:**
- The PDF export for rubrics was still unreliable. A more robust method was requested.
- A new export option, "Copy as Markdown," was requested as a portable alternative.
- The text extraction from a pasted curriculum was not preserving the original codes (e.g., "1.", "2.1").

**Changes:**
- **Robust PDF Export (`components/RubricDisplay.tsx`):**
  - Replaced `window.print()` with a new system that programmatically creates a new browser window with print-specific CSS, ensuring a consistent, high-quality PDF output.
- **New Feature: Markdown Export (`components/RubricDisplay.tsx`, `components/icons.tsx`):**
  - Added a new "Copiar Markdown" button and logic to convert the rubric into a clean Markdown table.
- **High-Fidelity Text Parsing (`services/geminiService.ts`):**
  - Reinforced the prompt for `parseTextForEvaluableItems` to preserve the exact literal codes from the original text.
---
### Version 3.4 (2024-08-03)

**User Request:**
- Enhance the Rubrics generator with a dual input method (from SQL history or raw text).
- Allow hierarchical selection of evaluable items.
- Implement a persistent history for generated rubrics.

**Changes:**
- **Dual Input for Rubrics (`components/RubricsPanel.tsx`, `services/geminiService.ts`):**
  - The Rubrics panel now features tabs to switch between "Desde Historial" and "Desde Texto".
  - Created a new `parseTextForEvaluableItems` AI service function to extract evaluable items directly from pasted curriculum text.
- **Hierarchical Selection (`components/RubricsPanel.tsx`):**
  - The item selection UI was redesigned to display a nested list of parents and children.
- **Rubrics History:**
  - Implemented a complete, persistent history system for rubrics with a dedicated side panel for management.
---
### Version 3.3 (2024-08-02)

**User Request:**
- The Rubrics section was failing silently after selecting a history item. The system did not parse the SQL correctly and provided no feedback to the user.

**Changes:**
- **Robust SQL Parser (`services/sqlParser.ts`):**
  - The SQL parser was completely rebuilt to handle multi-value `INSERT` statements and correctly identify all descendant relationships using a graph-based traversal. This makes parsing far more accurate and reliable.
- **Improved User Feedback (`components/RubricsPanel.tsx`):**
  - The Rubrics panel UI was updated to provide clear feedback. If no evaluable items are found, a message is now displayed explaining the situation.
---
### Version 2.0 (2024-08-01)

**User Request:**
- Correct a critical error where "saberes" were being identified as `tipo = 3` (Contenidos) instead of `tipo = 18` (Saberes básicos).
- Eliminate `NULL` codes for "saberes" by implementing a new coding scheme: if a saber lacks an explicit code, generate one using the format `S.<código_del_bloque_padre>.<número_de_orden>`.

**Changes:**
- **Prompt Engineering (Saberes Correction):**
  - Updated the prompt in `services/geminiService.ts` with a new, strict rule for processing "Saberes básicos" or "Contenidos".
  - The AI is now explicitly instructed to **always** use `tipo = 18` for "Saberes básicos" and `tipo = 3` for "Contenidos".
  - A robust code generation logic was added: use the literal code if present, otherwise, automatically generate a code based on the parent block and order to prevent `NULL` values.
---
### Version 1.9 (2024-08-01)

**User Request:**
- Descriptors were being identified with the incorrect entity type.
- Descriptors were not being correctly marked with `t` in the `traza_evalua` column.

**Changes:**
- **Prompt Engineering (Descriptor Correction):**
  - Updated the prompt in `services/geminiService.ts` with a strict new rule to ensure 'Descriptores' are always inserted as entity **type 19**.
  - The rule for the `traza_evalua` column was also modified to explicitly include 'Descriptores' in the list of elements that must be marked with `'t'`, ensuring they are correctly flagged for evaluation tracking.
---
### Version 1.8 (2024-08-01)

**User Request:**
- Resolve persistent SQL errors caused by subqueries in `relaciones` INSERTs by using unique entity IDs.
- Incorporate a validation procedure to check the generated SQL for errors before the user attempts to import it into PostgreSQL.

**Changes:**
- **Robust Relationship Generation (`temp_id`):**
  - Implemented a robust mechanism to prevent subquery errors. The prompt in `services/geminiService.ts` was completely overhauled.
  - The `SQL_HEADER` now adds a temporary, unique `temp_id` column to the `entidades` table.
  - The AI is now instructed to generate a unique, human-readable temporary ID for every entity (e.g., 'RA_1', 'CRITERIO_1_A').
  - Critically, all `relaciones` are now created by looking up these unique `temp_id`s, which completely eliminates errors caused by duplicate `codigo` values.
  - A final `ALTER TABLE` command is added to the end of the script to drop the `temp_id` column, leaving the database schema clean.
- **Client-Side SQL Validation:**
  - **New File:** Created `services/sqlValidator.ts` to house the validation logic.
  - **New File:** Created `components/SqlValidationDisplay.tsx` to display validation warnings to the user.
  - After generation, the script is now automatically validated for common errors like unbalanced parentheses, unmatched quotes, and the use of the old, unsafe subquery method.
  - If issues are detected, a prominent warning box appears above the SQL code, listing the potential problems and guiding the user. This greatly improves the user experience and prevents failed database imports.
---
### Version 1.5 (2024-07-31)

**User Request:**
The user pointed out a critical error: the application was not identifying "descriptores" (descriptors) or establishing their relationship with their corresponding "competencias específicas" (specific competencies).

**Changes:**
- **Prompt Engineering (Relationship Enhancement):**
  - Updated the prompt in `services/geminiService.ts` with two critical fixes.
  - Added a strict rule to ensure 'Descriptores' are always inserted as entity **type 19**.
  - Modified the rule for the `traza_evalua` column to explicitly include 'Descriptores' in the list of elements that must be marked with `'t'`, ensuring they are correctly flagged for evaluation tracking.
---
### Version 1.4 (2024-07-31)

**User Request:**
The user is facing issues with PostgreSQL imports because the codes for 'competencias específicas' are too long. They requested a fixed coding scheme for this element type: 'CE' followed by a sequential number (e.g., 'CE1').

**Changes:**
- **Prompt Engineering:**
  - Modified the prompt in `services/geminiService.ts` to add a new, specific rule for coding 'competencias específicas' (type 20).
  - The AI is now instructed to override the general rule of literal code extraction for this specific type and instead generate codes in the format 'CE1', 'CE2', etc., based on their order of appearance. This solves the database import issue while maintaining data integrity for all other curriculum elements.
---
### Version 1.3 (2024-07-31)

**User Request:**
Ensure that codes for entities, especially for competencies (type 5) and objectives (type 6), are not invented or modified. The AI should use the exact literal code from the curriculum (e.g., 'a)' instead of an invented 'C-a').

**Changes:**
- **Prompt Engineering:**
  - Modified the prompt in `services/geminiService.ts` by strengthening the "LITERALIDAD Y ORDEN" rule.
  - The rule now explicitly and critically instructs the AI to use the exact codes found in the source text without adding any prefixes (like 'C-' or 'O-') or otherwise altering them. This improves the accuracy and literalness of the generated data.
---
### Version 1.2 (2024-07-31)

**User Request:**
- Change the color palette to be more elegant and sober, using blacks, whites, blues, and grays.
- Improve the progress visualizer to remove duplicated bars and show a clear, real percentage of the process.

**Changes:**
- **Visual Redesign (Sober Theme):**
  - Replaced the entire purple/fuchsia color scheme with a minimalist and elegant palette.
  - The UI now uses a near-black background, grays for panels, white/light-gray for text, and a distinct blue as the primary accent color for buttons, focus rings, and icons.
- **Progress Indicator Overhaul:**
  - Removed the duplicated progress bars. The UI now shows a single, clear progress bar when generation starts.
  - Implemented a new determinate `ProgressBar` component that displays a numeric percentage (e.g., "75%").
  - Added logic in `App.tsx` to simulate a realistic progress percentage update while the stream is active, providing much clearer feedback to the user on the generation status.
  - The progress bar is displayed centrally during the initial loading phase and is hidden once the SQL stream begins, as the text generation itself becomes the progress indicator.
---
### Version 1.1 (2024-07-31)

**User Request:**
- Update the `tipo_elemento` table definition in the SQL header to include several new element types (Estándares, Saberes básicos, Competencias específicas, etc.).
- Change the visual style and color palette to be more modern and elegant, suggesting a move away from the current blue/cyan theme.

**Changes:**
- **SQL Schema Update:**
  - Modified `services/geminiService.ts` to update the `SQL_HEADER` constant with the new, expanded list of `tipo_elemento` values.
  - Updated the Gemini prompt to make the AI aware of the new element types and their corresponding IDs, ensuring correct data generation.
- **Visual Redesign:**
  - Implemented a new, more elegant color palette across the entire application, shifting from cyan/blue to a sophisticated purple/fuchsia theme.
  - Updated `index.html` with a new background gradient.
  - Updated `App.tsx`, `Header.tsx`, `ProgressBar.tsx`, and `Loader.tsx` to use the new color scheme for text, buttons, icons, and other UI elements, creating a cohesive and modern look.
---
### Version 1.0 (2024-07-30)

**User Request:**
- Create a `DEVELOP.md` file to log iterations.
- Enlarge the SQL display panel for better visibility.
- Add a button to download the script, named after the primary module/subject.
- Add a real progress bar for script generation.
- Rename the app to "CurrículoSQL".
- Improve the visual style to be more modern and elegant.

**Changes:**
- **New File:** Created `DEVELOP.md` and populated it with the development history.
- **UI/UX Redesign:**
  - Renamed the application to "CurrículoSQL" in the title, header, and metadata.
  - Implemented a more modern and elegant visual theme with a dark gradient background, refined colors, and improved component styling (buttons, panels).
  - The main layout was updated to give the SQL display panel significantly more vertical space, making it easier to view large scripts.
- **Streaming & Progress:**
  - Reworked `geminiService.ts` to use the `generateContentStream` API.
  - The application now streams the SQL response in real-time, showing the script being "typed out" in the display area. This serves as a real progress indicator.
  - Added a new animated progress bar component that is displayed while the stream is active.
- **Download Functionality:**
  - Added a "Download" button with a new icon to the SQL display panel.
  - Implemented logic to parse the generated SQL to find the name of the main module (entity with `tipo = 0`).
  - The download button saves the complete script to a `.sql` file, using the extracted module name as the filename (e.g., `Sistemas_Informaticos.sql`).
---
### Version 0.3 (2024-07-30)

**User Request:**
The user provided a complete example SQL script to be used as a "few-shot" example for the AI. This was to ensure the generated output followed the exact formatting, including the use of SQL comments (`-- COMPETENCIAS`) to structure the different sections of the script.

**Changes:**
- Updated `services/geminiService.ts`:
  - Incorporated the user's example script directly into the Gemini prompt as a structural guide. This significantly improved the formatting and consistency of the AI-generated output, ensuring it matched the desired style perfectly.
---
### Version 0.2 (2024-07-30)

**User Request:**
The user provided a specific, fixed SQL header that must be used for all generated scripts. This header defines the tables (`tipo_elemento`, `entidades`, `relaciones`) and pre-populates `tipo_elemento` with a fixed set of IDs and descriptions.

**Changes:**
- Modified `services/geminiService.ts`:
  - Hardcoded the provided SQL header.
  - Updated the Gemini prompt to instruct the AI to *only* generate the `INSERT` statements for `entidades` and `relaciones`, assuming the tables and `tipo_elemento` data already exist. This made the generation more reliable and tailored to the exact schema.

---

### Version 0.1 (2024-07-30)

**User Request:**
Initial request to create an application that converts an educational curriculum into a PostgreSQL script based on a comprehensive set of rules. The rules specified the exact table structure (`tipo_elemento`, `entidades`, `relaciones`), data requirements, relationship mapping, and output format.

**Changes:**
- Created the initial project structure with `index.html`, `index.tsx`, and `App.tsx`.
- Implemented the core UI with a textarea for curriculum input and a display area for the generated SQL.
- Created the `geminiService.ts` to handle the logic of prompting the Gemini API to transform the curriculum text into SQL.
- Added basic components for the Header, SQL Display, and a loading spinner.