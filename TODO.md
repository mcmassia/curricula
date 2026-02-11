# Tareas Pendientes (Checklist)

Este archivo sirve para llevar un seguimiento de las tareas solicitadas por el usuario para cada nueva versión, garantizando que todos los cambios se implementen correctamente.

---

### Versión 8.3 (2024-09-13)

**Solicitud:** Mejorar la importación y gestión de alumnos con más campos, acciones en lote, una vista de detalle y filtros.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 8.3.
- [x] **`types.ts`**:
    - [x] Expandir las interfaces `Student` y `SavedStudent` para incluir los nuevos campos opcionales (`idNumber`, `age`, `phone`, `address`, `tags`).
- [x] **`services/studentService.ts`**:
    - [x] Añadir una nueva función `updateStudent` para guardar los cambios en el perfil de un alumno.
- [x] **`components/ImportStudentsModal.tsx`**:
    - [x] Sobrescribir la lógica de parseo para extraer los nuevos campos del CSV (`Etiquetas`, `ID`, `Edad`, `Teléfono`, `Dirección`, `Población`).
    - [x] Confirmar que la codificación `latin1` se sigue utilizando para manejar caracteres especiales.
- [x] **`components/StudentDetailModal.tsx`** (Nuevo Componente):
    - [x] Crear el modal para mostrar la ficha completa del alumno.
    - [x] Implementar un modo de visualización y un modo de edición con un formulario.
    - [x] Mostrar todos los datos del alumno, incluyendo los grupos a los que pertenece.
- [x] **`App.tsx`**:
    - [x] Añadir estados para gestionar el nuevo modal de detalle: `viewingStudent`, `isStudentDetailModalOpen`.
    - [x] Implementar manejadores `handleViewStudent` (para abrir el modal) y `handleUpdateStudent` (para guardar cambios).
    - [x] Actualizar `handleDeleteStudent` para que pueda aceptar un array de IDs para borrado en lote.
    - [x] Renderizar el nuevo `StudentDetailModal`.
- [x] **`components/StudentsPanel.tsx`**:
    - [x] Añadir barras de búsqueda para filtrar la lista de grupos y la lista de alumnos.
    - [x] Añadir checkboxes a cada alumno y una opción "Seleccionar Todos".
    - [x] Implementar un nuevo toolbar de "Acciones en lote" que aparezca cuando se seleccionen alumnos.
    - [x] Añadir la funcionalidad de asignación en lote al toolbar.
    - [x] Añadir la funcionalidad de borrado en lote al toolbar.
    - [x] Hacer que el nombre de cada alumno sea un botón que abra el nuevo modal de detalle.

---

### Versión 8.2 (2024-09-12)

**Solicitud:** Implementar una nueva sección "Alumnos" con gestión de grupos, asignación de currículos e importación de alumnos desde CSV.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 8.2.
- [x] **`types.ts`**:
    - [x] Añadir interfaces `Student`, `SavedStudent`, `StudentGroup`, `SavedStudentGroup`.
    - [x] Añadir `'students'` a la `View` type.
- [x] **`components/icons.tsx`**: Añadir `UserPlusIcon`.
- [x] **`services/studentService.ts`** (Nuevo): Crear servicio de Firestore para CRUD de alumnos.
- [x] **`services/groupService.ts`** (Nuevo): Crear servicio de Firestore para CRUD de grupos.
- [x] **`services/firebaseErrorHelper.ts`**: Actualizar para reconocer las nuevas colecciones `students` y `student_groups`.
- [x] **`components/SideNav.tsx`**: Añadir el nuevo enlace "Alumnos" a la navegación principal.
- [x] **`App.tsx`**:
    - [x] Añadir estados para `savedStudents` y `savedGroups`.
    - [x] Cargar los nuevos datos al iniciar sesión.
    - [x] Implementar manejadores: `handleSaveStudent`, `handleDeleteStudent`, `handleImportStudents`, `handleSaveGroup`, `handleUpdateGroup`, `handleDeleteGroup`, `handleAssignCurricula`.
    - [x] Renderizar `StudentsPanel` y los nuevos modales.
- [x] **`components/WelcomePanel.tsx`**:
    - [x] Añadir una "Stat Card" para "Alumnos".
    - [x] Actualizar los datos del `BarChart` para incluir alumnos y grupos.
- [x] **`components/ImportStudentsModal.tsx`** (Nuevo): Crear modal para la importación de alumnos desde un archivo CSV.
- [x] **`components/AssignCurriculaModal.tsx`** (Nuevo): Crear modal para asignar currículos a un grupo.
- [x] **`components/StudentsPanel.tsx`** (Nuevo): Crear el panel principal de la sección "Alumnos" con el layout de dos columnas y toda la lógica de UI.

---

### Versión 8.1 (2024-09-11)

**Solicitud:** Rediseñar la página de inicio para que sea un dashboard más visual e informativo. Hacer que la barra de navegación lateral sea colapsable. Arreglar el desbordamiento de texto.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 8.1.
- [x] **`components/icons.tsx`**:
    - [x] Añadir `ChevronDoubleLeftIcon` para el botón de colapsar/expandir.
    - [x] Añadir `BarChartIcon` y `UsersIcon` para el nuevo dashboard.
- [x] **`components/BarChart.tsx`** (Nuevo Componente):
    - [x] Crear un componente reutilizable para renderizar un gráfico de barras simple con SVG.
- [x] **`App.tsx`**:
    - [x] Añadir estado (`isNavOpen`) y manejador (`handleToggleNav`) para controlar la barra lateral.
    - [x] Pasar los nuevos props a `SideNav`.
    - [x] Pasar `rubricsHistory` a `WelcomePanel` para las estadísticas.
- [x] **`components/SideNav.tsx`**:
    - [x] Refactorizar completamente para que sea colapsable.
    - [x] Añadir un botón en la parte superior para expandir/colapsar.
    - [x] Cambiar el ancho dinámicamente (`w-64` a `w-20`).
    - [x] Ocultar las etiquetas de texto cuando está colapsado.
    - [x] Añadir tooltips a los iconos cuando está colapsado.
- [x] **`components/WelcomePanel.tsx`**:
    - [x] Reemplazar el diseño antiguo por un nuevo dashboard.
    - [x] Añadir "Stat Cards" en la parte superior para mostrar las cuentas totales (Currículos, Unidades, etc.).
    - [x] Integrar el nuevo componente `BarChart` para visualizar la distribución de contenido.
    - [x] Reorganizar los widgets existentes ("Añadido Recientemente", "Sugerencia IA") en un nuevo layout de grid.
    - [x] **(BUG FIX)** Aplicar la clase `truncate` a los títulos en la lista de "Añadido Recientemente" para evitar el desbordamiento de texto.

---

### Versión 8.0 (2024-09-10)

**Solicitud:** Implementar una nueva sección 'Evaluar Trabajo' en Utilidades. El usuario subirá un archivo (texto, PDF, imagen) y seleccionará una Rúbrica de su repositorio. La IA devolverá un informe con puntuaciones y feedback.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 8.0.
- [x] **`types.ts`**:
    - [x] Añadir `GradingResult` y `GradingCriterionResult` para estructurar la respuesta de la IA.
- [x] **`services/geminiService.ts`**:
    - [x] Crear la nueva función `gradeAssignment` con un prompt multi-modal para analizar un archivo y una rúbrica.
- [x] **`App.tsx`**:
    - [x] Añadir nuevos estados: `isGrading`, `gradingResult`, `gradingError`.
    - [x] Implementar el manejador `handleGradeAssignment` que procesa el archivo, llama a la IA y gestiona el estado.
    - [x] Actualizar la vista de `UtilitiesPanel` para pasarle los props necesarios (`rubricsHistory`, el nuevo handler y los nuevos estados).
- [x] **`components/UtilitiesPanel.tsx`**:
    - [x] Rediseñar el layout a una parrilla de dos columnas para acomodar la nueva herramienta.
    - [x] Crear el componente o la lógica para "Evaluar Trabajo con IA".
    - [x] Añadir un input de archivo que acepte múltiples tipos.
    - [x] Añadir un dropdown que se popule con `rubricsHistory`.
    - [x] Crear una vista de resultados para mostrar la evaluación de la IA (puntuaciones por criterio y feedback).

---

### Versión 7.9 (2024-09-09)

**Solicitud:** Renovar por completo la sección "Mejoras" con 20 ideas nuevas y relevantes, y añadir la capacidad de eliminar tarjetas de mejora.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 7.9.
- [x] **`services/improvementsService.ts`**: Reemplazar la lista obsoleta de mejoras con 20 nuevas ideas potentes y alineadas con las capacidades actuales de la aplicación.
- [x] **`components/ImprovementsPanel.tsx`**: Añadir un botón de eliminar (`TrashIcon`) a cada tarjeta de mejora y conectarlo a una nueva prop `onDelete`.
- [x] **`App.tsx`**:
    - [x] Implementar el manejador `handleDeleteImprovement` para actualizar el estado y eliminar una tarjeta de mejora.
    - [x] Aumentar el número de mejoras que se cargan inicialmente a 9.

---

### Versión 7.8 (2024-09-08)

**Solicitud:** Renombrar la sección "Scripts SQL" a "Currículos" para mayor claridad.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 7.8.
- [x] **`components/SideNav.tsx`**: Cambiar la etiqueta del menú de "Scripts SQL" a "Currículos".
- [x] **`components/WelcomePanel.tsx`**: Actualizar la tarjeta de "Scripts SQL" a "Currículos" y ajustar su descripción.
- [x] **`components/SqlRepositoryPanel.tsx`**: Cambiar el título de "Repositorio de Scripts SQL" a "Repositorio de Currículos" y ajustar el texto introductorio.

---

### Versión 7.7 (2024-09-07)

**Solicitud:** Crear una nueva sección "Recursos Educativos" para guardar y gestionar recursos web asociados a los currículos. Integrar esta funcionalidad con las sugerencias de la IA.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist y marcarla como completada.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 7.7.
- [x] **`types.ts`**:
    - [x] Añadir `EducationalResource` y `SavedEducationalResource`.
    - [x] Actualizar `View` para incluir `'resources'`.
- [x] **`components/icons.tsx`**: Añadir `BookmarkIcon`.
- [x] **`services/educationalResourceService.ts`** (Nuevo Componente): Crear servicio de Firestore para `educational_resources` con `load`, `save`, `delete`.
- [x] **`services/firebaseErrorHelper.ts`**: Actualizar el helper para que reconozca errores de la nueva colección.
- [x] **`components/SideNav.tsx`**: Añadir "Recursos Educativos" al menú principal.
- [x] **`components/WelcomePanel.tsx`**: Añadir tarjeta para "Recursos Educativos" al dashboard.
- [x] **`App.tsx`**:
    - [x] Añadir estado para `savedEducationalResources`, `isAddResourceModalOpen`, `curriculumForResources`.
    - [x] Cargar recursos al iniciar sesión.
    - [x] Añadir manejadores `handleSaveEducationalResource`, `handleDeleteEducationalResource`, y para abrir/cerrar el modal de añadir.
    - [x] Actualizar `handleSuggestResources` para guardar el contexto del currículo.
    - [x] Renderizar `EducationalResourcesPanel` y `AddResourceModal`.
- [x] **`components/SqlRepositoryPanel.tsx`**: Actualizar prop `onSuggestResources` para pasar el `item` completo.
- [x] **`components/ResourceSuggestModal.tsx`**:
    - [x] Añadir botón "Guardar" a cada recurso sugerido.
    - [x] Recibir props para saber qué recursos ya están guardados y mostrar el estado "Guardado".
- [x] **`components/EducationalResourcesPanel.tsx`** (Nuevo Componente): Crear el repositorio principal de recursos, con agrupación por currículo, búsqueda y acciones de gestión.
- [x] **`components/AddResourceModal.tsx`** (Nuevo Componente): Crear el formulario modal para añadir un recurso manualmente y asociarlo a un currículo.

---

### Versión 7.6 (2024-09-06)

**Solicitud:** Implementar una nueva funcionalidad "Sugerir Recursos" que, a partir de los saberes de un currículo, busque en la web y proponga recursos educativos.

- [x] **`TODO.md`**: Actualizar este archivo con la nueva checklist y marcarla como completada.
- [x] **`DEVELOP.md`**: Crear la entrada para la nueva versión 7.6.
- [x] **`types.ts`**: Añadir nuevas interfaces `SuggestedResource` y `SaberWithResources` para la nueva funcionalidad.
- [x] **`services/geminiService.ts`**: Crear la nueva función `suggestResourcesForSaberes` que utiliza Google Search grounding para encontrar recursos educativos online.
- [x] **`components/SqlRepositoryPanel.tsx`**: Añadir un nuevo botón "Sugerir Recursos" a cada elemento del repositorio de SQL.
- [x] **`App.tsx`**:
    - [x] Añadir nuevos estados para gestionar el modal y los datos de los recursos (`isResourceModalOpen`, `suggestedResources`, `isLoadingResources`, `resourceError`).
    - [x] Crear el nuevo manejador `handleSuggestResources` que extrae los saberes y llama al servicio de IA.
    - [x] Renderizar el nuevo modal `ResourceSuggestModal`.
- [x] **`components/ResourceSuggestModal.tsx`** (Nuevo Componente): Crear el modal para mostrar los recursos sugeridos, gestionando el estado de carga, errores y la visualización de los resultados.

---

### Versión 7.5 (2024-09-05)

**Solicitud:** Corregir regresiones graves en la generación de SQL: la cabecera ha desaparecido y los tipos de entidad no se identifican correctamente.

- [x] **Crear `TODO.md`**: Implementar este archivo para el seguimiento de tareas.
- [x] **Restaurar Cabecera SQL**: Asegurar que el script SQL final siempre contenga la cabecera completa (`CREATE TABLE`, `INSERT INTO tipo_elemento`, etc.).
- [x] **Corregir Identificación de Tipos (IA)**: Reforzar el prompt en `geminiService.ts` con una regla de máxima prioridad para que la IA asigne los `tipo` de entidad correctos según la codificación oficial.
- [x] **Corregir Identificación de Tipos (Parser)**: Actualizar los analizadores internos en `sqlParser.ts` para que utilicen los códigos de tipo correctos, asegurando la coherencia en toda la aplicación.
- [x] **Actualizar `DEVELOP.md`**: Documentar los cambios y la introducción de este nuevo flujo de trabajo.