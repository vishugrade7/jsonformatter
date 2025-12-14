'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { MergeView, MergeConfig } from '@codemirror/merge';
import { useTheme } from 'next-themes';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { Language } from '@/lib/language-detect';
import { ViewMode } from './toolbar';
import { EditorState } from '@codemirror/state';

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
        return () => {
            if (mergeInstanceRef.current) {
                mergeInstanceRef.current.destroy();
                mergeInstanceRef.current = null;
            }
        };
    }, []);

    const getLangExtension = () => {
        switch (language) {
            case 'javascript':
                return javascript({ jsx: true, typescript: true });
            case 'xml':
                return xml();
            case 'html':
                return html();
            case 'java':
            case 'apex':
                return java();
            case 'python':
                return python();
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

            const config: MergeConfig = {
                a: {
                    doc: left,
                    extensions: [
                        ...commonExtensions,
                        EditorView.updateListener.of((update: ViewUpdate) => {
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
                        EditorView.updateListener.of((update: ViewUpdate) => {
                            if (update.docChanged) {
                                onRightChange(update.state.doc.toString());
                            }
                        })
                    ]
                },
                parent: mergeViewRef.current,
                revertControls: 'revert-a-to-b',
            };
            
            if(viewMode === 'unified') {
                config.merge = {
                    revert: 'a-to-b'
                }
            }


            mergeInstanceRef.current = new MergeView(config);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, resolvedTheme, language, viewMode]);

    // This effect handles external updates to `left` and `right` values
    useEffect(() => {
        const view = mergeInstanceRef.current;
        if (!view) return;

        const currentA = view.a.state.doc.toString();
        if (currentA !== left) {
            view.a.dispatch({
                changes: { from: 0, to: currentA.length, insert: left }
            });
        }

        const currentB = view.b.state.doc.toString();
        if (currentB !== right) {
            view.b.dispatch({
                changes: { from: 0, to: currentB.length, insert: right }
            });
        }
    }, [left, right]);


    if (!isMounted) {
        return null;
    }

    return <div ref={mergeViewRef} className="absolute inset-0" />;
};

DiffCodeMirror.displayName = 'DiffCodeMirror';
