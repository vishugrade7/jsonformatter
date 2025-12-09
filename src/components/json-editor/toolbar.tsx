'use client';

import { 
    AlignLeft, 
    ArrowDownUp, 
    Copy, 
    ChevronDown,
    Download,
    Expand,
    Filter,
    Redo, 
    Search, 
    Undo, 
    Wrench,
    X
} from "lucide-react";
import { Button } from "../ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export type ViewMode = 'code' | 'tree' | 'form' | 'text' | 'view';

interface ToolbarProps {
    onCopy: () => void;
    onFormat: () => void;
    onSort: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onDownload: () => void;
    onExpand: () => void;
    onViewModeChange: (mode: ViewMode) => void;
    viewMode: ViewMode;
    onRepair: () => void;
}

export function Toolbar({ 
    onCopy, 
    onFormat, 
    onSort, 
    onUndo, 
    onRedo,
    onClear,
    onDownload,
    onExpand,
    onViewModeChange,
    viewMode,
    onRepair,
}: ToolbarProps) {
    return (
        <div className="flex items-center justify-between p-1 border-b border-border bg-card/60 backdrop-blur">
            <div className="flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFormat}><AlignLeft className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Format</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSort}><ArrowDownUp className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Sort</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" disabled><Filter className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Filter (coming soon)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRepair}><Wrench className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Repair</p></TooltipContent>
                    </Tooltip>
                    <div className="h-5 border-l mx-2"></div>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo}><Undo className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Undo</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo}><Redo className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Redo</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2 capitalize">
                        {viewMode}
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => onViewModeChange('code')}>Code</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onViewModeChange('form')}>Form</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onViewModeChange('text')}>Text</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onViewModeChange('tree')}>Tree</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onViewModeChange('view')}>View</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}><X className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Clear</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}><Download className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Download</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy to clipboard</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExpand}>
                                <Expand className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Expand / Fullscreen</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
