'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { DiffCodeMirror } from './diff-codemirror';
import { Toolbar, type ViewMode } from './toolbar';
import { useToast } from '@/hooks/use-toast';
import { Language, detectLanguage } from '@/lib/language-detect';

const initialLeft = `{
  "name": "John Doe",
  "age": 30,
  "isStudent": false,
  "courses": [
    {"title": "History", "credits": 3},
    {"title": "Math", "credits": 4}
  ]
}`;

const initialRight = `{
  "name": "Jane Doe",
  "age": 31,
  "isStudent": true,
  "courses": [
    {"title": "History", "credits": 3},
    {"title": "Art", "credits": 2}
  ],
  "major": "Art"
}`;


export function DiffEditorView() {
    const [leftValue, setLeftValue] = useState(initialLeft);
    const [rightValue, setRightValue] = useState(initialRight);
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [language, setLanguage] = useState<Language>('json');
    const editorPaneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        setLanguage(detectLanguage(leftValue));
    }, []);

     useEffect(() => {
        setLanguage(detectLanguage(leftValue));
    }, [leftValue]);

    const handleUpload = (content: string, side: 'left' | 'right') => {
        if (side === 'left') {
            setLeftValue(content);
        } else {
            setRightValue(content);
        }
        toast({ title: `File uploaded to ${side} editor` });
    };

    const handleClearAll = () => {
        setLeftValue('');
        setRightValue('');
        toast({ title: 'Cleared both editors' });
    };
    
    const handleSwap = () => {
        const temp = leftValue;
        setLeftValue(rightValue);
        setRightValue(temp);
        toast({ title: 'Swapped editors' });
    };

    if (!isMounted) {
        return null;
    }
    
    return (
        <div className="flex flex-1 flex-col h-full md:h-auto">
            <div ref={editorPaneRef} className="flex-1 flex flex-col border-b md:border-b-0 border-border bg-background h-full">
                <Toolbar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    language={language}
                    onLanguageChange={setLanguage}
                    onUpload={handleUpload}
                    onClear={handleClearAll}
                    onSwap={handleSwap}
                />
                <div className="flex-1 relative">
                    <DiffCodeMirror
                        left={leftValue}
                        right={rightValue}
                        onLeftChange={setLeftValue}
                        onRightChange={setRightValue}
                        language={language}
                        viewMode={viewMode}
                    />
                </div>
            </div>
        </div>
    );
}
