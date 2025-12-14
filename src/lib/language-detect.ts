export type Language = 'json' | 'javascript' | 'xml' | 'text' | 'python' | 'java' | 'html' | 'apex';

export function detectLanguage(code: string): Language {
    const trimmedCode = code.trim();

    if (trimmedCode.startsWith('<!DOCTYPE html>') || trimmedCode.startsWith('<html')) {
        return 'html';
    }

    if (trimmedCode.startsWith('<') && trimmedCode.endsWith('>')) {
        // Basic check for XML/HTML
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(trimmedCode, "application/xml");
            if (doc.getElementsByTagName("parsererror").length === 0) {
                return 'xml';
            }
        } catch (e) {
            // ignore
        }
    }
    
    if ((trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) || (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))) {
        try {
            JSON.parse(trimmedCode);
            return 'json';
        } catch (e) {
            // Not valid JSON, might be JS object
        }
    }

    // Basic checks for JavaScript keywords. This is not foolproof.
    const jsKeywords = ['function', 'const', 'let', 'var', 'import', 'export', '=>'];
    if (jsKeywords.some(kw => trimmedCode.includes(kw))) {
        return 'javascript';
    }

    const pythonKeywords = ['def', 'import ', 'from ', 'class ', 'if ', 'else ', 'elif '];
    if (pythonKeywords.some(kw => trimmedCode.includes(kw))) {
        return 'python';
    }
    
    const javaKeywords = ['public class', 'public static void', 'import java.'];
    if (javaKeywords.some(kw => trimmedCode.includes(kw))) {
        return 'java';
    }
    
    const apexKeywords = ['@AuraEnabled', 'Database.executeBatch'];
     if (apexKeywords.some(kw => trimmedCode.includes(kw))) {
        return 'apex';
    }

    return 'text';
}
