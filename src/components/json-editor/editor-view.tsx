'use client';

import { useState, useCallback } from 'react';
import { JsonCodeMirror } from './json-codemirror';
import { EditorControls } from './editor-controls';
import { EmptyState } from './empty-state';
import { Toolbar } from './toolbar';

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

export function EditorView() {
    const [leftValue, setLeftValue] = useState(initialJson);
    const [rightValue, setRightValue] = useState('');
    const [isComparing, setIsComparing] = useState(false);

    const handleCopy = useCallback((from: string, to: 'left' | 'right') => {
        if (to === 'left') {
            setLeftValue(from);
        } else {
            setRightValue(from);
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


    return (
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col border-r border-border">
                <Toolbar onCopy={() => handleCopy(leftValue, 'right')} />
                <div className="flex-1 relative">
                    {leftValue ? (
                        <JsonCodeMirror
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
                <Toolbar onCopy={() => handleCopy(rightValue, 'left')} />
                <div className="flex-1 relative">
                    {rightValue ? (
                        <JsonCodeMirror
                            value={rightValue}
                            onChange={setRightValue}
                        />
                    ) : (
                        <EmptyState onCreateObject={() => createObject('right')} onCreateArray={() => createArray('right')} />
                    )}
                </div>
            </div>
        </div>
    );
}
