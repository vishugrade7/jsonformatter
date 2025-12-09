'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { useTheme } from 'next-themes';
import { history } from '@codemirror/commands';

export interface CodeMirrorEditor {
  undo: () => void;
  redo: () => void;
}

interface JsCodeMirrorProps {
    value: string;
    onChange: (value: string) => void;
    readonly?: boolean;
}

export const JsCodeMirror = forwardRef<
  { editor: CodeMirrorEditor },
  JsCodeMirrorProps
>(({ value, onChange, readonly = false }, ref) => {
    const { resolvedTheme } = useTheme();
    const editorRef = useRef<any>(null);
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
    
    const extensions = [history(), javascript({ jsx: true, typescript: true })];

    if (!isMounted) {
        return null;
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

JsCodeMirror.displayName = 'JsCodeMirror';
