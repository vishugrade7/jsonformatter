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
import prettierPluginXml from '@prettier/plugin-xml';
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

    const handleFormat = useCallback(async () => {
        const value = leftValue;
        if (!value) {
            toast({ title: 'Input is empty', description: `Editor on the left is empty.`, variant: 'destructive' });
            return;
        }
        
        try {
            const formatted = await prettierFormat(value, {
              parser: 'json',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              tabWidth: parseInt(indent, 10),
            });
            setRightValue(formatted);
            setRightViewMode('code');
            toast({ title: 'JSON Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: 'Invalid syntax.', variant: 'destructive' });
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
        const blob = new Blob([value], { type: lang === 'xml' ? 'application/xml' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-${side}.${lang}`;
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

    const handleExpand = () => {
        // Fullscreen logic can be complex, for now we just toast
        toast({ title: 'Expand/Fullscreen coming soon!' });
    }

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
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col border-r border-border">
                <Toolbar 
                    onCopy={() => handleCopyToClipboard('left')} 
                    onFormat={() => handleFormat()}
                    onSort={() => handleSort('left')}
                    onUndo={() => handleUndo('left')}
                    onRedo={() => handleRedo('left')}
                    onClear={() => handleClearPane('left')}
                    onDownload={() => handleDownload('left')}
                    onExpand={handleExpand}
                    onViewModeChange={setLeftViewMode}
                    viewMode={leftViewMode}
                />
                <div className="flex-1 relative bg-background">
                    {renderPane('left')}
                </div>
            </div>

            <EditorControls
                onUpload={handleUpload}
                onValidate={handleValidate}
                onFormat={handleFormat}
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
            />

            <div className="flex-1 flex flex-col">
                 <Toolbar 
                    onCopy={() => handleCopyToClipboard('right')} 
                    onFormat={() => {
                        toast({ title: "Cannot format this view", description: "Formatting is only available for the main input editor.", variant: "destructive" });
                    }}
                    onSort={() => handleSort('right')}
                    onUndo={() => handleUndo('right')}
                    onRedo={() => handleRedo('right')}
                    onClear={() => handleClearPane('right')}
                    onDownload={() => handleDownload('right')}
                    onExpand={handleExpand}
                    onViewModeChange={setRightViewMode}
                    viewMode={rightViewMode}
                />
                <div className="flex-1 relative bg-background">
                    {renderPane('right')}
                </div>
            </div>
        </div>
    );
}

    