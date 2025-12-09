'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { XmlCodeMirror, type CodeMirrorEditor } from './xml-codemirror';
import { EditorControls } from './editor-controls';
import { EmptyState } from '../json-editor/empty-state';
import { Toolbar, type ViewMode } from './toolbar';
import { useToast } from '@/hooks/use-toast';
import { format as prettierFormat } from 'prettier/standalone';
import prettierPluginXml from '@prettier/plugin-xml';
import { xml2json } from 'xml-js';

const initialXml = `<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>`;


export function XmlEditorView() {
    const [leftValue, setLeftValue] = useState(initialXml);
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

    const rightLang = useMemo<'json' | 'xml'>(() => {
        const trimmed = rightValue.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return 'json';
        }
        return 'xml';
    }, [rightValue]);

    const formatXml = useCallback(async (xml: string, indentWidth: number, minify = false) => {
        try {
            const formatted = await prettierFormat(xml, {
              parser: 'xml',
              plugins: [prettierPluginXml],
              tabWidth: indentWidth,
              printWidth: minify ? 0 : 80,
            });
            return minify ? formatted.replace(/\n/g, '') : formatted;
          } catch (error: any) {
            throw new Error('Invalid XML.');
          }
    }, []);

    const handleCopy = useCallback(async (from: string, to: 'left' | 'right') => {
        try {
            const formatted = await formatXml(from, parseInt(indent, 10));
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
    }, [indent, formatXml]);

    const createObject = (side: 'left' | 'right') => {
        const objectXml = '<root>\n</root>';
        if (side === 'left') {
            setLeftValue(objectXml);
            setLeftViewMode('code');
        } else {
            setRightValue(objectXml);
            setRightViewMode('code');
        }
    };

    const createArray = (side: 'left' | 'right') => {
        const arrayXml = '<root>\n  <item>1</item>\n  <item>2</item>\n</root>';
         if (side === 'left') {
            setLeftValue(arrayXml);
            setLeftViewMode('code');
        } else {
            setRightValue(arrayXml);
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
            const formatted = await formatXml(value, parseInt(indent, 10));
            if (side === 'left') {
                setLeftValue(formatted);
            } else {
                setRightValue(formatted);
            }
            toast({ title: 'XML Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: error.message, variant: 'destructive' });
        }
    }, [leftValue, rightValue, indent, toast, formatXml]);

    const handleCentralFormat = useCallback(async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: `Editor on the left is empty.`, variant: 'destructive' });
            return;
        }
        
        try {
            const formatted = await formatXml(leftValue, parseInt(indent, 10));
            setRightValue(formatted);
            setRightViewMode('code');
            toast({ title: 'XML Formatted' });
        } catch (error: any) {
            toast({ title: 'Formatting Error', description: error.message, variant: 'destructive' });
        }
    }, [leftValue, indent, toast, formatXml]);

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
            await formatXml(leftValue, 2);
            toast({ title: 'Validation Successful', description: 'XML document is valid and well-formed.' });
        } catch {
            toast({ title: 'Validation Failed', description: 'The XML document is invalid or not well-formed.', variant: 'destructive' });
        }
    };

    const handleMinify = async () => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: 'Please enter XML in the left editor to minify.', variant: 'destructive'});
            return;
        }
        try {
            const minified = await formatXml(leftValue, 0, true);
            setRightValue(minified);
            setRightViewMode('code');
            toast({ title: 'XML Minified' });
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
        const lang = side === 'left' ? 'xml' : rightLang;
        const blob = new Blob([value], { type: lang === 'json' ? 'application/json' : 'application/xml' });
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

    const handleConvert = (format: 'json') => {
        if (!leftValue) {
            toast({ title: 'Input is empty', description: 'Please enter XML in the left editor to convert.', variant: 'destructive'});
            return;
        }

        try {
            if (format === 'json') {
                const json = xml2json(leftValue, { compact: true, spaces: parseInt(indent, 10) });
                setRightValue(JSON.stringify(JSON.parse(json), null, parseInt(indent, 10)));
                setRightViewMode('code');
                toast({ title: 'Converted to JSON' });
            }
        } catch (e: any) {
            toast({ title: 'Conversion Error', description: 'Invalid XML.', variant: 'destructive' });
        }
    };

    const handleLoadSample = () => {
        setLeftValue(initialXml);
        setRightValue('');
        toast({ title: 'Sample data loaded' });
    };
    
    if (!isMounted) {
        return null;
    }
    
    const renderPane = (side: 'left' | 'right') => {
        const value = side === 'left' ? leftValue : rightValue;
        const viewMode = side === 'left' ? leftViewMode : rightViewMode;
        const lang = side === 'left' ? 'xml' : rightLang;
        const onChange = side === 'left' ? setLeftValue : setRightValue;
        const editorRef = side === 'left' ? leftEditorRef : rightEditorRef;
        
        if (!value) {
             return <EmptyState onCreateObject={() => createObject(side)} onCreateArray={() => createArray(side)} />;
        }

        switch (viewMode) {
            case 'view':
                 return (
                    <XmlCodeMirror
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
                    <XmlCodeMirror
                        ref={editorRef}
                        value={value}
                        onChange={onChange}
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
                onConvert={handleConvert}
                onLoadSample={handleLoadSample}
            />

            <div ref={rightPaneRef} className="flex-1 flex flex-col bg-background h-1/2 md:h-full">
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
