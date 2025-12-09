'use client';

import { useState, useCallback, useRef } from 'react';
import { JsonCodeMirror, type CodeMirrorEditor } from './json-codemirror';
import { EditorControls } from './editor-controls';
import { EmptyState } from './empty-state';
import { Toolbar } from './toolbar';
import { useToast } from '@/hooks/use-toast';
import { format as prettierFormat } from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';

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

    const leftEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);
    const rightEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);

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
        } else {
            setRightValue(objectJson);
        }
    };

    const createArray = (side: 'left' | 'right') => {
        const arrayJson = JSON.stringify([], null, parseInt(indent, 10));
        if (side === 'left') {
            setLeftValue(arrayJson);
        } else {
            setRightValue(arrayJson);
        }
    };

    const handleFormat = useCallback(async (side?: 'left' | 'right') => {
        const formatValue = async (value: string, setter: (val: string) => void) => {
            if (!value) return;
            try {
                const formatted = await prettierFormat(value, {
                  parser: 'json',
                  plugins: [prettierPluginBabel, prettierPluginEstree],
                  tabWidth: parseInt(indent, 10),
                });
                setter(formatted);
                return true;
            } catch (error: any) {
                return false;
            }
        }

        let formattedLeft = true;
        let formattedRight = true;

        if (side === 'left' || !side) {
            formattedLeft = await formatValue(leftValue, setLeftValue);
        }
        if (side === 'right' || !side) {
            formattedRight = await formatValue(rightValue, setRightValue);
        }

        if ((side === 'left' && !formattedLeft) || (side === 'right' && !formattedRight) || (!side && (!formattedLeft || !formattedRight))) {
             toast({ title: 'Formatting Error', description: 'Invalid JSON.', variant: 'destructive' });
        } else {
             toast({ title: 'JSON Formatted' });
        }

    }, [leftValue, rightValue, indent, toast]);

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
        let rightValid = true;
        try {
            if(leftValue) JSON.parse(leftValue);
        } catch {
            leftValid = false;
        }
        try {
            if(rightValue) JSON.parse(rightValue);
        } catch {
            rightValid = false;
        }

        if (leftValid && rightValid) {
            toast({ title: 'Validation Successful', description: 'Both JSON documents are valid.' });
        } else {
            let description = '';
            if (!leftValid && !rightValid) description = 'Both JSON documents are invalid.';
            else if (!leftValid) description = 'The left JSON document is invalid.';
            else if (!rightValid) description = 'The right JSON document is invalid.';
            toast({ title: 'Validation Failed', description, variant: 'destructive' });
        }
    };

    const handleMinify = () => {
        try {
            if (leftValue) {
                const parsed = JSON.parse(leftValue);
                setLeftValue(JSON.stringify(parsed));
            }
            if (rightValue) {
                const parsed = JSON.parse(rightValue);
                setRightValue(JSON.stringify(parsed));
            }
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
        const blob = new Blob([value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-${side}.json`;
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

    return (
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col border-r border-border">
                <Toolbar 
                    onCopy={() => handleCopyToClipboard('left')} 
                    onFormat={() => handleFormat('left')}
                    onSort={() => handleSort('left')}
                    onUndo={() => handleUndo('left')}
                    onRedo={() => handleRedo('left')}
                    onClear={() => handleClearPane('left')}
                    onDownload={() => handleDownload('left')}
                    onExpand={handleExpand}
                />
                <div className="flex-1 relative">
                    {leftValue ? (
                        <JsonCodeMirror
                            ref={leftEditorRef}
                            value={leftValue}
                            onChange={setLeftValue}
                        />
                    ) : (
                        <EmptyState onCreateObject={() => createObject('left')} onCreateArray={() => createArray('left')} />
                    )}
                </div>
            </div>

            <EditorControls
                onUpload={handleUpload}
                onValidate={handleValidate}
                onFormat={() => handleFormat()}
                onMinify={handleMinify}
                onDownload={handleDownload}
                onCopyLeftToRight={() => handleCopy(leftValue, 'right')}
                onCopyRightToLeft={() => handleCopy(rightValue, 'left')}
                onCompare={setIsComparing}
                isComparing={isComparing}
                indent={indent}
                onIndentChange={setIndent}
                onClear={handleClearAll}
            />

            <div className="flex-1 flex flex-col">
                 <Toolbar 
                    onCopy={() => handleCopyToClipboard('right')} 
                    onFormat={() => handleFormat('right')}
                    onSort={() => handleSort('right')}
                    onUndo={() => handleUndo('right')}
                    onRedo={() => handleRedo('right')}
                    onClear={() => handleClearPane('right')}
                    onDownload={() => handleDownload('right')}
                    onExpand={handleExpand}
                />
                <div className="flex-1 relative">
                    {rightValue || isComparing ? (
                        <JsonCodeMirror
                            ref={rightEditorRef}
                            value={rightValue}
                            onChange={setRightValue}
                            isComparing={isComparing}
                            otherValue={leftValue}
                        />
                    ) : (
                        <EmptyState onCreateObject={() => createObject('right')} onCreateArray={() => createArray('right')} />
                    )}
                </div>
            </div>
        </div>
    );
}
