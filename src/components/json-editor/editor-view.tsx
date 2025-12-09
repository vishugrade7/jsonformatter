'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
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
    const { toast } = useToast();

    const leftEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);
    const rightEditorRef = useRef<{ editor: CodeMirrorEditor } | null>(null);

    const handleCopy = useCallback((from: string, to: 'left' | 'right') => {
        try {
            const parsed = JSON.parse(from);
            const formatted = JSON.stringify(parsed, null, 2);
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
    }, []);

    const createObject = (side: 'left' | 'right') => {
        const objectJson = JSON.stringify({}, null, 2);
        if (side === 'left') {
            setLeftValue(objectJson);
        } else {
            setRightValue(objectJson);
        }
    };

    const createArray = (side: 'left' | 'right') => {
        const arrayJson = JSON.stringify([], null, 2);
        if (side === 'left') {
            setLeftValue(arrayJson);
        } else {
            setRightValue(arrayJson);
        }
    };

    const handleFormat = useCallback(async (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) return;

        try {
            const formatted = await prettierFormat(value, {
              parser: 'json',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              tabWidth: 2,
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
    }, [leftValue, rightValue, toast]);

    const handleSort = useCallback((side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) return;

        try {
            const parsed = JSON.parse(value);
            const sorted = sortJSONObject(parsed);
            const formatted = JSON.stringify(sorted, null, 2);
            if (side === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }
            toast({ title: 'JSON Sorted' });
        } catch (error) {
            toast({ title: 'Sorting Error', description: 'Invalid JSON.', variant: 'destructive' });
        }
    }, [leftValue, rightValue, toast]);

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


    return (
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col border-r border-border">
                <Toolbar 
                    onCopy={() => handleCopyToClipboard('left')} 
                    onFormat={() => handleFormat('left')}
                    onSort={() => handleSort('left')}
                    onUndo={() => handleUndo('left')}
                    onRedo={() => handleRedo('left')}
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
                onCopyLeftToRight={() => handleCopy(leftValue, 'right')}
                onCopyRightToLeft={() => handleCopy(rightValue, 'left')}
                onCompare={setIsComparing}
                isComparing={isComparing}
            />

            <div className="flex-1 flex flex-col border-l border-border">
                 <Toolbar 
                    onCopy={() => handleCopyToClipboard('right')} 
                    onFormat={() => handleFormat('right')}
                    onSort={() => handleSort('right')}
                    onUndo={() => handleUndo('right')}
                    onRedo={() => handleRedo('right')}
                />
                <div className="flex-1 relative">
                    {rightValue ? (
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
