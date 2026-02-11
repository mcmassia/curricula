

/**
 * Attempts to automatically correct common, safe-to-fix errors in the generated SQL script.
 * This function handles missing semicolons, unbalanced parentheses, and trailing commas.
 * @param sql The raw SQL string.
 * @returns A corrected SQL string.
 */
export const autoCorrectSql = (sql: string): string => {
    let correctedSql = sql.trim();
    if (!correctedSql) {
        return '';
    }

    // 1. Ensure the script fragment ends with a semicolon to make parsing predictable.
    if (!correctedSql.endsWith(';')) {
        correctedSql += ';';
    }

    // 2. Fix trailing commas that might appear before a semicolon (e.g., `VALUES (...),;`).
    // This is a common AI generation artifact.
    correctedSql = correctedSql.replace(/,(\s*);/g, '$1;');

    // 3. Fix parenthesis imbalance. This heuristic assumes the most likely error is a missing 
    // closing parenthesis at the end of a multi-value INSERT statement, right before the semicolon.
    const parenCount = (correctedSql.match(/\(/g) || []).length - (correctedSql.match(/\)/g) || []).length;
    if (parenCount > 0) {
        // Find the last semicolon
        const lastSemicolonIndex = correctedSql.lastIndexOf(';');
        if (lastSemicolonIndex !== -1) {
            // Insert the missing parentheses before the last semicolon.
            correctedSql = correctedSql.slice(0, lastSemicolonIndex) + ')'.repeat(parenCount) + correctedSql.slice(lastSemicolonIndex);
        }
    }
    // Note: We don't attempt to fix parenCount < 0 as it's less common and harder to fix safely.

    // 4. Re-process the entire script to ensure each statement is correctly terminated and formatted.
    const statements = correctedSql.split(/;\s*[\r\n]+/);
    
    const correctedStatements = statements
        .map(stmt => stmt.trim()) // Clean up whitespace from each potential statement
        .filter(stmt => stmt.length > 0) // Remove any empty parts that result from splitting
        .map(stmt => {
            // Ensure every non-empty statement ends with a semicolon.
            if (!stmt.endsWith(';')) {
                return stmt + ';';
            }
            return stmt;
        });

    // Rejoin with a consistent double newline for readability.
    return correctedStatements.join('\n\n') + '\n';
};


/**
 * Validates the generated SQL for common errors that might prevent it from running.
 * @param sql The SQL string to validate.
 * @returns An array of error message strings.
 */
export const validateSql = (sql: string): string[] => {
    const errors: string[] = [];
    if (!sql) return errors;
    
    const lines = sql.split('\n');
  
    let parenCount = 0;
  
    lines.forEach((line, index) => {
      // Check for unbalanced parentheses
      parenCount += (line.match(/\(/g) || []).length;
      parenCount -= (line.match(/\)/g) || []).length;
  
      // Check for unmatched single quotes. This is a simple check and might have false positives in complex strings.
      if ((line.match(/'/g) || []).length % 2 !== 0) {
        errors.push(`Posible comilla sin cerrar en la línea ${index + 1}.`);
      }

      // Check for deprecated use of 'codigo' in subqueries for relations
      if (line.toUpperCase().includes("SELECT ID FROM ENTIDADES WHERE CODIGO=")) {
        errors.push(`Uso obsoleto de 'codigo' en una subconsulta en la línea ${index + 1}. Se debe usar 'temp_id'.`);
      }
    });
  
    if (parenCount !== 0) {
      errors.push('El número de paréntesis de apertura y cierre no coincide en el script.');
    }
  
    // Remove duplicates to avoid spamming the user
    return [...new Set(errors)];
  };