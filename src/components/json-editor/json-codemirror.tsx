'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { useTheme } from 'next-themes';
import { history } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { MergeView } from '@codemirror/merge';

export interface CodeMirrorEditor {
  undo: () => void;
  redo: () => void;
}

interface JsonCodeMirrorProps {
    value: string;
    onChange: (value: string) => void;
    readonly?: boolean;
    isComparing?: boolean;
    otherValue?: string;
    language?: 'json' | 'xml';
}

export const JsonCodeMirror = forwardRef<
  { editor: CodeMirrorEditor },
  JsonCodeMirrorProps
>(({ value, onChange, readonly = false, isComparing = false, otherValue = '', language = 'json' }, ref) => {
    const { resolvedTheme } = useTheme();
    const editorRef = useRef<any>(null);
    const mergeViewRef = useRef<HTMLDivElement>(null);
    const mergeInstanceRef = useRef<MergeView | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useImperativeHandle(ref, () => ({
        editor: {
          undo: () => {
            if (editorRef.current?.view) {
              history({
                view: editorRef.current.view,
                state: editorRef.current.view.state,
                dispatch: editorRef.current.view.dispatch
              }).undo(editorRef.current.view);
            }
          },
          redo: () => {
            if (editorRef.current?.view) {
                history({
                    view: editorRef.current.view,
                    state: editorRef.current.view.state,
                    dispatch: editorRef.current.view.dispatch
                  }).redo(editorRef.current.view);
            }
          }
        }
      }));

    useEffect(() => {
        if (isComparing && mergeViewRef.current && isMounted) {
            if (mergeInstanceRef.current) {
                mergeInstanceRef.current.destroy();
            }
            mergeInstanceRef.current = new MergeView({
                a: {
                    doc: otherValue,
                    extensions: [
                        json(),
                        EditorView.theme({
                            '&': {
                                backgroundColor: resolvedTheme === 'dark' ? '#272822' : '#ffffff',
                                color: resolvedTheme === 'dark' ? '#f8f8f2' : '#000000',
                                height: '100%',
                            },
                        }),
                        EditorView.editable.of(false),
                    ],
                },
                b: {
                    doc: value,
                    extensions: [
                        json(),
                         EditorView.theme({
                            '&': {
                                backgroundColor: resolvedTheme === 'dark' ? '#272822' : '#ffffff',
                                color: resolvedTheme === 'dark' ? '#f8f8f2' : '#000000',
                                height: '100%',
                            },
                        }),
                        EditorView.editable.of(false),
                    ],
                },
                parent: mergeViewRef.current,
            });
        }
        
        if (!isComparing && mergeInstanceRef.current) {
            mergeInstanceRef.current.destroy();
            mergeInstanceRef.current = null;
        }

    }, [isComparing, otherValue, value, resolvedTheme, isMounted]);
    
    useEffect(() => {
      return () => {
          if (mergeInstanceRef.current) {
              mergeInstanceRef.current.destroy();
              mergeInstanceRef.current = null;
          }
      };
    }, []);

    const extensions = [history()];
    if (language === 'xml') {
        extensions.push(xml());
    } else {
        extensions.push(json());
    }

    if (!isMounted) {
        return null;
    }

    if (isComparing) {
        return <div ref={mergeViewRef} className="absolute inset-0" />;
    }
    
    return (
        <div className="absolute inset-0">
            <CodeMirror
                ref={editorRef}
                value={value}
                onChange={onChange}
                extensions={extensions}
                theme={resolvedTheme === 'dark' ? okaidia : 'light'}
                height="100%"
                readOnly={readonly}
                style={{ height: '100%' }}
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    autocompletion: true,
                    highlightActiveLine: true,
                }}
            />
        </div>
    );
});

JsonCodeMirror.displayName = 'JsonCodeMirror';
