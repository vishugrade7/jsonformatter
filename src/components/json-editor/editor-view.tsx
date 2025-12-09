'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { JsonCodeMirror, type CodeMirrorEditor } from './json-codemirror';
import { EditorControls } from './editor-controls';
import { EmptyState } from './empty-state';
import { Toolbar, type ViewMode } from './toolbar';
import { useToast } from '@/hooks/use-toast';
import { format as prettierFormat } from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import { json2xml } from 'xml-js';
import Papa from 'papaparse';
import { JsonTreeView } from '../json-tree-view';
import { ScrollArea } from '../ui/scroll-area';
import { JsonFormView } from '../json-form-view';

const initialJson = `{
  "array": [
    1,
    2,
    3
  ],
  "boolean": true,
  "color": "gold",
  "null": null,
  "number": 123,
  "object": {
    "a": "b",
    "c": "d"
  },
  "string": "Hello World"
}`;

function sortJSONObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(sortJSONObject);
    }
    if (obj && typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).sort().reduce((acc, key) => {
            acc[key] = sortJSONObject(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
}


export function EditorView() {
    const [leftValue, setLeftValue] = useState(initialJson);
    const [rightValue, setRightValue] = useState('');
    const [isComparing, setIsComparing] = useState(false);
    const [indent, setIndent] = useState('2');
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const [leftViewMode, setLeftViewMode] = useState<ViewMode>('code');
    const [rightViewMode, setRightViewMode] = useState<ViewMode>('code');
    const leftPaneRef = useRef<HTMLDivElement>(null);
    const rightPaneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const leftEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);
    const rightEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);

    const rightLang = useMemo<'json' | 'xml' | 'text'>(() => {
        const trimmed = rightValue.trim();
        if (trimmed.startsWith('<')) {
            return 'xml';
        }
        try {
            JSON.parse(trimmed);
            return 'json';
        } catch {
            // It might be CSV or something else, treat as plain text
            return 'text';
        }
    }, [rightValue]);


    const getParsedJson = useCallback((value: string) => {
        if (!value.trim()) return null;
        try {
            return JSON.parse(value);
        } catch {
            return { error: 'Invalid JSON' };
        }
    }, []);

    const leftParsedJson = useMemo(() => getParsedJson(leftValue), [leftValue, getParsedJson]);
    const rightParsedJson = useMemo(() => getParsedJson(rightValue), [rightValue, getParsedJson]);

    const handleCopy = useCallback((from: string, to: 'left' | 'right') => {
        try {
            const parsed = JSON.parse(from);
            const formatted = JSON.stringify(parsed, null, parseInt(indent, 10));
            if (to === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }
        } catch {
            if (to === 'left') {
                setLeftValue(from);
            } else {
                setRightValue(from);
            }
        }
    }, [indent]);

    const createObject = (side: 'left' | 'right') => {
        const objectJson = JSON.stringify({}, null, parseInt(indent, 10));
        if (side === 'left') {
            setLeftValue(objectJson);
            setLeftViewMode('code');
        } else {
            setRightValue(objectJson);
            setRightViewMode('code');
        }
    };

    const createArray = (side: 'left' | 'right') => {
        const arrayJson = JSON.stringify([], null, parseInt(indent, 10));
        if (side === 'left') {
            setLeftValue(arrayJson);
            setLeftViewMode('code');
        } else {
            setRightValue(arrayJson);
            setRightViewMode('code');
        }
    };

    const handleFormat = useCallback(async (side: 'left' | 'right' = 'left') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) {
            toast({ title: 'Input is empty', description: `Editor on the ${side} is empty.`, variant: 'destructive' });
            return;
        }
        
        try {
            const formatted = await prettierFormat(value, {
              parser: 'json',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              tabWidth: parseInt(indent, 10),
            });
            
            if (side === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }

            toast({ title: 'JSON Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    }, [leftValue, rightValue, indent, toast]);

    const handleCentralFormat = useCallback(async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: `Editor on the left is empty.`, variant: 'destructive' });
            return;
        }
        
        try {
            const formatted = await prettierFormat(leftValue, {
              parser: 'json',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              tabWidth: parseInt(indent, 10),
            });
            setRightValue(formatted);
            setRightViewMode('code');
            toast({ title: 'JSON Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    }, [leftValue, indent, toast]);


    const handleSort = useCallback((side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) return;

        try {
            const parsed = JSON.parse(value);
            const sorted = sortJSONObject(parsed);
            const formatted = JSON.stringify(sorted, null, parseInt(indent, 10));
            if (side === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }
            toast({ title: 'JSON Sorted' });
        } catch (error) {
            toast({ title: 'Sorting Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    }, [leftValue, rightValue, indent, toast]);

    const handleCopyToClipboard = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) {
            toast({ title: 'Nothing to copy', variant: 'destructive' });
            return;
        }
        navigator.clipboard.writeText(value);
        toast({ title: 'Copied to clipboard' });
    }

    const handleUndo = (side: 'left' | 'right') => {
        const ref = side === 'left' ? leftEditorRef : rightEditorRef;
        ref.current?.editor.undo();
    };

    const handleRedo = (side: 'left' | 'right') => {
        const ref = side === 'left' ? leftEditorRef : rightEditorRef;
        ref.current?.editor.redo();
    };
    
    const handleUpload = (content: string) => {
        setLeftValue(content);
        toast({ title: 'File uploaded successfully' });
    };

    const handleValidate = () => {
        let leftValid = true;
        try {
            if(leftValue) JSON.parse(leftValue);
        } catch {
            leftValid = false;
        }
        
        if (leftValid) {
            toast({ title: 'Validation Successful', description: 'JSON document is valid.' });
        } else {
            toast({ title: 'Validation Failed', description: 'The JSON document is invalid.', variant: 'destructive' });
        }
    };

    const handleMinify = () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: 'Please enter JSON in the left editor to minify.', variant: 'destructive'});
            return;
        }
        try {
            const parsed = JSON.parse(leftValue);
            setRightValue(JSON.stringify(parsed));
            setRightViewMode('code');
            toast({ title: 'JSON Minified' });
        } catch (error) {
            toast({ title: 'Minify Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    };
    
    const handleDownload = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) {
            toast({ title: 'Nothing to download', variant: 'destructive' });
            return;
        }
        const lang = side === 'left' ? 'json' : rightLang;
        const blob = new Blob([value], { type: lang === 'xml' ? 'application/xml' : lang === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-${side}.${lang === 'text' ? 'csv' : lang}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearPane = (side: 'left' | 'right') => {
        if (side === 'left') {
            setLeftValue('');
        } else {
            setRightValue('');
        }
        toast({ title: `Cleared ${side} editor` });
    }
    
    const handleClearAll = () => {
        setLeftValue('');
        setRightValue('');
        toast({ title: 'Cleared both editors' });
    };

    const handleExpand = (side: 'left' | 'right') => {
        const paneRef = side === 'left' ? leftPaneRef : rightPaneRef;
        const elem = paneRef.current;

        if (elem) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                elem.requestFullscreen().catch(err => {
                    toast({
                        title: 'Fullscreen Error',
                        description: `Could not enter fullscreen mode: ${err.message}`,
                        variant: 'destructive'
                    });
                });
            }
        }
    }

    const handleRepair = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) return;

        try {
            // First, try to parse it as is.
            JSON.parse(value);
            toast({ title: 'JSON is already valid', description: 'No repair needed.' });
            return;
        } catch (e) {
            // JSON is invalid, proceed with repair attempts.
        }

        try {
            let repaired = value;

            // 1. Add missing quotes to keys
            repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
            // 2. Replace single quotes with double quotes
            repaired = repaired.replace(/'/g, '"');
            // 3. Remove trailing commas in objects and arrays
            repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
            // 4. Add missing commas between properties
            repaired = repaired.replace(/([}\]"'])\s*\n\s*([\\"{])/g, '$1,\n$2');
            
            // 5. Attempt to fix structural issues (missing brackets/braces)
            const stack: ('{' | '[')[] = [];
            for (const char of repaired) {
                if (char === '{' || char === '[') {
                    stack.push(char);
                } else if (char === '}') {
                    if (stack.length > 0 && stack[stack.length - 1] === '{') {
                        stack.pop();
                    }
                } else if (char === ']') {
                    if (stack.length > 0 && stack[stack.length - 1] === '[') {
                        stack.pop();
                    }
                }
            }

            // Add missing closing characters
            while (stack.length > 0) {
                const openChar = stack.pop();
                if (openChar === '{') {
                    repaired += '}';
                } else if (openChar === '[') {
                    repaired += ']';
                }
            }

            // Final validation attempt
            const parsed = JSON.parse(repaired);
            const formatted = JSON.stringify(parsed, null, parseInt(indent, 10));

            const setter = side === 'left' ? setLeftValue : setRightValue;
            setter(formatted);

            toast({ title: 'JSON Repaired', description: 'Successfully fixed common JSON errors.' });
        } catch (e) {
            toast({ title: 'Repair Failed', description: 'Could not automatically repair the JSON.', variant: 'destructive' });
        }
    };

    const handleConvert = (format: 'xml' | 'csv') => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: 'Please enter JSON in the left editor to convert.', variant: 'destructive'});
            return;
        }

        try {
            if (format === 'xml') {
                const xml = json2xml(leftValue, { compact: false, spaces: parseInt(indent, 10) });
                setRightValue(xml);
                setRightViewMode('code');
                toast({ title: 'Converted to XML' });
            } else if (format === 'csv') {
                const json = JSON.parse(leftValue);
                if (!Array.isArray(json)) {
                    toast({ title: 'Conversion Error', description: 'CSV conversion only supports an array of objects.', variant: 'destructive' });
                    return;
                }
                const csv = Papa.unparse(json);
                setRightValue(csv);
                setRightViewMode('code');
                toast({ title: 'Converted to CSV' });
            }
        } catch (e: any) {
            toast({ title: 'Conversion Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    };

    const handleLoadSample = () => {
        setLeftValue(initialJson);
        setRightValue('');
        toast({ title: 'Sample data loaded' });
    };
    
    const onDataChange = useCallback((newData: any, side: 'left' | 'right') => {
        const setter = side === 'left' ? setLeftValue : setRightValue;
        try {
            const jsonString = JSON.stringify(newData, null, parseInt(indent, 10));
            setter(jsonString);
        } catch (e) {
            console.error("Failed to stringify new data", e);
        }
    }, [indent]);


    if (!isMounted) {
        return null;
    }
    
    const renderPane = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        const viewMode = side === 'left' ? leftViewMode : rightViewMode;
        const parsedJson = side === 'left' ? leftParsedJson : rightParsedJson;
        const lang = side === 'left' ? 'json' : rightLang;
        const onChange = side === 'left' ? setLeftValue : setRightValue;
        const editorRef = side === 'left' ? leftEditorRef : rightEditorRef;
        
        if (!value && !(side === 'right' && isComparing)) {
             return <EmptyState onCreateObject={() => createObject(side)} onCreateArray={() => createArray(side)} />;
        }

        switch (viewMode) {
            case 'tree':
                if (parsedJson?.error) {
                    return <div className="p-4 text-destructive">Invalid JSON for Tree view.</div>;
                }
                return (
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            <JsonTreeView data={parsedJson} />
                        </div>
                    </ScrollArea>
                );
            case 'form':
                if (parsedJson?.error) {
                    return <div className="p-4 text-destructive">Invalid JSON for Form view.</div>;
                }
                 return (
                    <ScrollArea className="h-full">
                        <div className="p-4">
                             <JsonFormView data={parsedJson} onChange={(newData) => onDataChange(newData, side)} />
                        </div>
                    </ScrollArea>
                );
            case 'text':
                return (
                    <JsonCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
                        language="text"
                    />
                );
            case 'view':
                 return (
                    <JsonCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
                        language={lang}
                        readonly={true}
                    />
                );
            case 'code':
            default:
                 return (
                    <JsonCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
                        isComparing={side === 'right' && isComparing}
                        otherValue={leftValue}
                        language={lang}
                    />
                );
        }
    }

    return (
        <div className="flex flex-1 flex-col md:flex-row h-full md:h-[calc(100vh-150px)]">
            <div ref={leftPaneRef} className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border bg-background h-1/2 md:h-full">
                <Toolbar 
                    onCopy={() => handleCopyToClipboard('left')} 
                    onFormat={() => handleFormat('left')}
                    onSort={() => handleSort('left')}
                    onUndo={() => handleUndo('left')}
                    onRedo={() => handleRedo('left')}
                    onClear={() => handleClearPane('left')}
                    onDownload={() => handleDownload('left')}
                    onExpand={() => handleExpand('left')}
                    onViewModeChange={setLeftViewMode}
                    viewMode={leftViewMode}
                    onRepair={() => handleRepair('left')}
                />
                <div className="flex-1 relative">
                    {renderPane('left')}
                </div>
            </div>

            <EditorControls
                onUpload={handleUpload}
                onValidate={handleValidate}
                onFormat={handleCentralFormat}
                onMinify={handleMinify}
                onDownload={() => handleDownload('left')}
                onCopyLeftToRight={() => handleCopy(leftValue, 'right')}
                onCopyRightToLeft={() => handleCopy(rightValue, 'left')}
                onCompare={setIsComparing}
                isComparing={isComparing}
                indent={indent}
                onIndentChange={setIndent}
                onClear={handleClearAll}
                onConvert={handleConvert}
                onLoadSample={handleLoadSample}
            />

            <div ref={rightPaneRef} className="flex-1 flex flex-col bg-background h-1/2 md:h-full">
                 <Toolbar 
                    onCopy={() => handleCopyToClipboard('right')} 
                    onFormat={() => handleFormat('right')}
                    onSort={() => handleSort('right')}
                    onUndo={() => handleUndo('right')}
                    onRedo={() => handleRedo('right')}
                    onClear={() => handleClearPane('right')}
                    onDownload={() => handleDownload('right')}
                    onExpand={() => handleExpand('right')}
                    onViewModeChange={setRightViewMode}
                    viewMode={rightViewMode}
                    onRepair={() => handleRepair('right')}
                />
                <div className="flex-1 relative">
                    {renderPane('right')}
                </div>
            </div>
        </div>
    );
}
