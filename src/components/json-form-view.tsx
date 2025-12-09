'use client';

import { useState, useCallback } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const getRenderableItems = (data: any) => {
    if (Array.isArray(data)) return data.map((_, i) => i);
    if (typeof data === 'object' && data !== null) return Object.keys(data);
    return [];
};

const EditableValue = ({ value, onValueChange }: { value: any, onValueChange: (newValue: any) => void }) => {
    const type = typeof value;
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(String(value ?? ''));

    const handleBlur = () => {
        setIsEditing(false);
        let newValue;
        if (type === 'number') {
            newValue = parseFloat(currentValue);
            if (isNaN(newValue)) newValue = 0;
        } else if (type === 'boolean') {
            newValue = currentValue.toLowerCase() === 'true';
        } else if (value === null) {
            newValue = null;
        }
        else {
            newValue = currentValue;
        }
        onValueChange(newValue);
    };
    
    if (type === 'boolean') {
        return <Checkbox checked={value} onCheckedChange={onValueChange} />;
    }

    if (isEditing) {
        return (
            <Input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                autoFocus
                className="h-6 text-sm"
            />
        );
    }
    
    const displayValue = value === null ? 'null' : String(value);
    const valueClass = cn({
        "text-fuchsia-500 dark:text-fuchsia-400": value === null || type === 'boolean',
        "text-emerald-600 dark:text-emerald-400": type === 'string',
        "text-sky-600 dark:text-sky-400": type === 'number',
    });

    return (
        <span onClick={() => setIsEditing(true)} className={cn("cursor-pointer", valueClass)}>
            {type === 'string' ? `"${displayValue}"` : displayValue}
        </span>
    );
};

const AddProperty = ({ onAdd }: { onAdd: (key: string, type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array') => void }) => {
    const [key, setKey] = useState('');
    
    const handleAdd = (type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array') => {
        if (key) {
            onAdd(key, type);
            setKey('');
        }
    };

    return (
        <div className="flex items-center gap-2 pl-6 ml-3 my-1">
            <Input 
                placeholder="key" 
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                className="h-6 text-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleAdd('string')}>String</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAdd('number')}>Number</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAdd('boolean')}>Boolean</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAdd('null')}>Null</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAdd('object')}>Object</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAdd('array')}>Array</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};


const JsonFormNode = ({ name, data, isRoot = false, path, onDataChange }: { name?: string, data: any, isRoot?: boolean, path: (string|number)[], onDataChange: (path: (string|number)[], value: any) => void }) => {
    const [isOpen, setIsOpen] = useState(isRoot);
    const isObject = typeof data === 'object' && data !== null;
    const isArray = Array.isArray(data);
    const items = getRenderableItems(data);
    const itemType = isArray ? 'items' : 'properties';

    const handleValueChange = useCallback((key: string | number, newValue: any) => {
        onDataChange([...path, key], newValue);
    }, [path, onDataChange]);
    
    const handleDelete = useCallback((key: string | number) => {
        onDataChange([...path, key], undefined);
    }, [path, onDataChange]);

    const handleAddProperty = useCallback((key: string, type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array') => {
        let newValue: any;
        switch(type) {
            case 'string': newValue = ''; break;
            case 'number': newValue = 0; break;
            case 'boolean': newValue = false; break;
            case 'null': newValue = null; break;
            case 'object': newValue = {}; break;
            case 'array': newValue = []; break;
        }
        onDataChange([...path, key], newValue);
    }, [path, onDataChange]);

    if (!isObject) {
        return (
            <div className="flex items-center space-x-2 group">
                <span className="text-rose-600 dark:text-rose-400 font-medium">{name ? `"${name}":` : ''}</span>
                <EditableValue value={data} onValueChange={(newValue) => onDataChange(path, newValue)} />
            </div>
        );
    }

    const trigger = (
        <CollapsibleTrigger asChild>
            <div className="flex items-center cursor-pointer w-full group">
                <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
                <span className="text-rose-600 dark:text-rose-400 font-medium pl-1 pr-2">{name ? `"${name}":` : ''}</span>
                <span className="text-muted-foreground">{isArray ? '[' : '{'}</span>
                {!isOpen && <span className="text-muted-foreground ml-1">{items.length} {itemType}...</span>}
                {!isOpen && <span className="text-muted-foreground ml-1">{isArray ? ']' : '}'}</span>}
                {!isRoot && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDataChange(path, undefined); }}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </CollapsibleTrigger>
    );

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {trigger}
            <CollapsibleContent>
                <div className="pl-6 border-l border-border/50 ml-3">
                    {items.map(key => (
                        <div key={key} className="flex items-center space-x-2 group">
                            <JsonFormNode 
                                name={isArray ? undefined : String(key)} 
                                data={data[key]}
                                path={[...path, key]}
                                onDataChange={onDataChange}
                            />
                             {!isArray && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(key)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {!isArray && <AddProperty onAdd={handleAddProperty} />}
                </div>
                <span className="text-muted-foreground pl-1">{isArray ? ']' : '}'}</span>
            </CollapsibleContent>
        </Collapsible>
    );
};

export const JsonFormView = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    
    const handleDataChange = useCallback((path: (string | number)[], value: any) => {
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        let current = newData;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        
        const lastKey = path[path.length - 1];

        if (value === undefined) { // Indicates deletion
            if (Array.isArray(current)) {
                current.splice(Number(lastKey), 1);
            } else {
                delete current[lastKey];
            }
        } else {
            current[lastKey] = value;
        }

        onChange(newData);

    }, [data, onChange]);
    
    return (
        <div className="font-code text-sm">
            <JsonFormNode data={data} isRoot path={[]} onDataChange={handleDataChange} />
        </div>
    );
};
