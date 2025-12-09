'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { JsCodeMirror, type CodeMirrorEditor } from './js-codemirror';
import { EditorControls } from './editor-controls';
import { EmptyState } from '../json-editor/empty-state';
import { Toolbar, type ViewMode } from './toolbar';
import { useToast } from '@/hooks/use-toast';
import { format as prettierFormat } from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';

const initialJs = `function hello() {
  console.log("Hello, World!");
}`;


export function JsEditorView() {
    const [leftValue, setLeftValue] = useState(initialJs);
    const [rightValue, setRightValue] = useState('');
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

    const formatJs = useCallback(async (code: string, indentWidth: number, minify = false) => {
        try {
            // Note: Prettier doesn't have a true "minify" for JS, 
            // but we can get close by using a small print width and removing comments.
            // For a true minify, a tool like Terser would be needed.
            const formatted = await prettierFormat(code, {
              parser: 'babel',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              tabWidth: indentWidth,
              printWidth: minify ? 1 : 80,
            });
            return formatted;
          } catch (error: any) {
            throw new Error('Invalid JavaScript.');
          }
    }, []);

    const handleCopy = useCallback(async (from: string, to: 'left' | 'right') => {
        try {
            const formatted = await formatJs(from, parseInt(indent, 10));
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
    }, [indent, formatJs]);

    const createObject = (side: 'left' | 'right') => {
        const objectJs = 'const obj = {};';
        if (side === 'left') {
            setLeftValue(objectJs);
            setLeftViewMode('code');
        } else {
            setRightValue(objectJs);
            setRightViewMode('code');
        }
    };

    const createArray = (side: 'left' | 'right') => {
        const arrayJs = 'const arr = [];';
         if (side === 'left') {
            setLeftValue(arrayJs);
            setLeftViewMode('code');
        } else {
            setRightValue(arrayJs);
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
            const formatted = await formatJs(value, parseInt(indent, 10));
            if (side === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }
            toast({ title: 'JavaScript Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: error.message, variant: 'destructive' });
        }
    }, [leftValue, rightValue, indent, toast, formatJs]);

    const handleCentralFormat = useCallback(async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: `Editor on the left is empty.`, variant: 'destructive' });
            return;
        }
        
        try {
            const formatted = await formatJs(leftValue, parseInt(indent, 10));
            setRightValue(formatted);
            setRightViewMode('code');
            toast({ title: 'JavaScript Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: error.message, variant: 'destructive' });
        }
    }, [leftValue, indent, toast, formatJs]);

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

    const handleValidate = async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', variant: 'destructive'});
            return;
        }
        try {
            // Use prettier's parser to validate syntax
            await formatJs(leftValue, 2);
            toast({ title: 'Validation Successful', description: 'JavaScript syntax is valid.' });
        } catch {
            toast({ title: 'Validation Failed', description: 'The JavaScript has syntax errors.', variant: 'destructive' });
        }
    };

    const handleMinify = async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: 'Please enter JS in the left editor to minify.', variant: 'destructive'});
            return;
        }
        try {
            const minified = await formatJs(leftValue, 0, true);
            setRightValue(minified);
            setRightViewMode('code');
            toast({ title: 'JavaScript Minified' });
        } catch (error: any) {
            toast({ title: 'Minify Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const handleDownload = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        if (!value) {
            toast({ title: 'Nothing to download', variant: 'destructive' });
            return;
        }
        const blob = new Blob([value], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-${side}.js`;
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

    const handleLoadSample = () => {
        setLeftValue(initialJs);
        setRightValue('');
        toast({ title: 'Sample data loaded' });
    };
    
    if (!isMounted) {
        return null;
    }
    
    const renderPane = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        const viewMode = side === 'left' ? leftViewMode : rightViewMode;
        const onChange = side === 'left' ? setLeftValue : setRightValue;
        const editorRef = side === 'left' ? leftEditorRef : rightEditorRef;
        
        if (!value) {
             return <EmptyState onCreateObject={() => createObject(side)} onCreateArray={() => createArray(side)} />;
        }

        switch (viewMode) {
            case 'view':
                 return (
                    <JsCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
                        readonly={true}
                    />
                );
            case 'code':
            default:
                 return (
                    <JsCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
                    />
                );
        }
    }

    return (
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-150px)]">
            <div ref={leftPaneRef} className="flex-1 flex flex-col border-r border-border bg-background">
                <Toolbar 
                    onCopy={() => handleCopyToClipboard('left')} 
                    onFormat={() => handleFormat('left')}
                    onUndo={() => handleUndo('left')}
                    onRedo={() => handleRedo('left')}
                    onClear={() => handleClearPane('left')}
                    onDownload={() => handleDownload('left')}
                    onExpand={() => handleExpand('left')}
                    onViewModeChange={setLeftViewMode}
                    viewMode={leftViewMode}
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
                indent={indent}
                onIndentChange={setIndent}
                onClear={handleClearAll}
                onLoadSample={handleLoadSample}
            />

            <div ref={rightPaneRef} className="flex-1 flex flex-col bg-background">
                 <Toolbar 
                    onCopy={() => handleCopyToClipboard('right')} 
                    onFormat={() => handleFormat('right')}
                    onUndo={() => handleUndo('right')}
                    onRedo={() => handleRedo('right')}
                    onClear={() => handleClearPane('right')}
                    onDownload={() => handleDownload('right')}
                    onExpand={() => handleExpand('right')}
                    onViewModeChange={setRightViewMode}
                    viewMode={rightViewMode}
                />
                <div className="flex-1 relative">
                    {renderPane('right')}
                </div>
            </div>
        </div>
    );
}
