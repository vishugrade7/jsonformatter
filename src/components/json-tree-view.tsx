'use client';

import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const getRenderableItems = (data: any) => {
    if (Array.isArray(data)) return data.map((_, i) => i);
    if (typeof data === 'object' && data !== null) return Object.keys(data);
    return [];
};

const Value = ({ value }: { value: any }) => {
    const type = typeof value;
    if (value === null) return <span className="text-fuchsia-500 dark:text-fuchsia-400">null</span>;
    if (type === 'string') return <span className="text-emerald-600 dark:text-emerald-400">"{value}"</span>;
    if (type === 'number') return <span className="text-sky-600 dark:text-sky-400">{value}</span>;
    if (type === 'boolean') return <span className="text-fuchsia-500 dark:text-fuchsia-400">{String(value)}</span>;
    return null;
};

const JsonNode = ({ name, data, isRoot = false }: { name?: string, data: any, isRoot?: boolean }) => {
    const [isOpen, setIsOpen] = useState(isRoot);
    const isObject = typeof data === 'object' && data !== null;
    const isArray = Array.isArray(data);
    const items = getRenderableItems(data);
    const itemType = isArray ? 'items' : 'properties';

    if (!isObject) {
        return (
            <div className="flex items-center">
                <span className="text-rose-600 dark:text-rose-400 font-medium pr-2">"{name}":</span>
                <Value value={data} />
            </div>
        );
    }

    const trigger = (
        <CollapsibleTrigger asChild>
            <div className="flex items-center cursor-pointer w-full">
                <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
                <span className="text-rose-600 dark:text-rose-400 font-medium pl-1 pr-2">{name ? `"${name}":` : ''}</span>
                <span className="text-muted-foreground">{isArray ? '[' : '{'}</span>
                {!isOpen && <span className="text-muted-foreground ml-1">{items.length} {itemType}...</span>}
                {!isOpen && <span className="text-muted-foreground ml-1">{isArray ? ']' : '}'}</span>}
            </div>
        </CollapsibleTrigger>
    );

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {trigger}
            <CollapsibleContent>
                <div className="pl-6 border-l border-border/50 ml-3">
                    {items.map(key => (
                        <JsonNode key={key} name={isArray ? undefined : String(key)} data={data[key]} />
                    ))}
                </div>
                <span className="text-muted-foreground pl-1">{isArray ? ']' : '}'}</span>
            </CollapsibleContent>
        </Collapsible>
    );
};

export const JsonTreeView = ({ data }: { data: any }) => {
    return (
        <div className="font-code text-sm">
            <JsonNode data={data} isRoot />
        </div>
    );
};
