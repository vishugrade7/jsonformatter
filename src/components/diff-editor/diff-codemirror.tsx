'use client';

import React, { useRef, useEffect, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { MergeView } from '@codemirror/merge';
import { useTheme } from 'next-themes';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { Language } from '@/lib/language-detect';
import { ViewMode } from './toolbar';

export interface CodeMirrorEditor {
  undo: () => void;
  redo: () => void;
}

interface DiffCodeMirrorProps {
    left: string;
    right: string;
    onLeftChange: (value: string) => void;
    onRightChange: (value: string) => void;
    language: Language;
    viewMode: ViewMode;
}

export const DiffCodeMirror = ({ left, right, onLeftChange, onRightChange, language, viewMode }: DiffCodeMirrorProps) => {
    const { resolvedTheme } = useTheme();
    const mergeViewRef = useRef<HTMLDivElement>(null);
    const mergeInstanceRef = useRef<MergeView | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getLangExtension = () => {
        switch (language) {
            case 'javascript':
                return javascript({ jsx: true, typescript: true });
            case 'xml':
                return xml();
            case 'json':
            default:
                return json();
        }
    }

    useEffect(() => {
        if (mergeViewRef.current && isMounted) {
            if (mergeInstanceRef.current) {
                mergeInstanceRef.current.destroy();
            }

            const theme = resolvedTheme === 'dark' ? okaidia : EditorView.baseTheme({});
            const highlightTheme = EditorView.theme({
                '&': {
                    backgroundColor: 'transparent',
                    color: resolvedTheme === 'dark' ? '#f8f8f2' : '#000000',
                    height: '100%',
                },
                 '.cm-scroller': { overflow: 'auto' },
            });

            const commonExtensions = [
                getLangExtension(),
                theme,
                highlightTheme,
                EditorView.lineWrapping,
            ];

            mergeInstanceRef.current = new MergeView({
                a: {
                    doc: left,
                    extensions: [
                        ...commonExtensions,
                        EditorView.updateListener.of((update) => {
                            if (update.docChanged) {
                                onLeftChange(update.state.doc.toString());
                            }
                        })
                    ]
                },
                b: {
                    doc: right,
                    extensions: [
                       ...commonExtensions,
                        EditorView.updateListener.of((update) => {
                            if (update.docChanged) {
                                onRightChange(update.state.doc.toString());
                            }
                        })
                    ]
                },
                merge: viewMode === 'split' ? true : undefined,
                revertControls: 'revert-a',
                parent: mergeViewRef.current,
            });
        }
        
        return () => {
            if (mergeInstanceRef.current) {
                mergeInstanceRef.current.destroy();
                mergeInstanceRef.current = null;
            }
        };
    }, [left, right, isMounted, resolvedTheme, language, onLeftChange, onRightChange, viewMode]);

    if (!isMounted) {
        return null;
    }

    return <div ref={mergeViewRef} className="absolute inset-0" />;
};

DiffCodeMirror.displayName = 'DiffCodeMirror';
