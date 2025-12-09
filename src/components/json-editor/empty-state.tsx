'use client';

import { Button } from "../ui/button";

interface EmptyStateProps {
    onCreateObject: () => void;
    onCreateArray: () => void;
}

export function EmptyState({ onCreateObject, onCreateArray }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">Empty document</h3>
            <p className="text-sm text-muted-foreground mb-4">
                You can paste clipboard data using Ctrl+V, or use the following options:
            </p>
            <div className="flex flex-col space-y-2 w-full max-w-xs">
                <Button variant="secondary" onClick={onCreateObject}>Create object</Button>
                <Button variant="secondary" onClick={onCreateArray}>Create array</Button>
            </div>
        </div>
    );
}
