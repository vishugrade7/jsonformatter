'use client';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { useTheme } from 'next-themes';

interface JsonCodeMirrorProps {
    value: string;
    onChange: (value: string) => void;
    readonly?: boolean;
}

export function JsonCodeMirror({ value, onChange, readonly = false }: JsonCodeMirrorProps) {
    const { resolvedTheme } = useTheme();

    return (
        <div className="absolute inset-0">
            <CodeMirror
                value={value}
                onChange={onChange}
                extensions={[json()]}
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
}
