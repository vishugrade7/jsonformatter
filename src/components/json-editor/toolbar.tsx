'use client';

import { AlignLeft, ArrowDownUp, Copy, ExternalLink, Filter, MoreVertical, Redo, Search, Undo } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ToolbarProps {
    onCopy: () => void;
    onFormat: () => void;
    onSort: () => void;
    onUndo: () => void;
    onRedo: () => void;
}

export function Toolbar({ onCopy, onFormat, onSort, onUndo, onRedo }: ToolbarProps) {
    return (
        <div className="flex items-center justify-between p-1 border-b border-border bg-card/50">
            <div className="flex items-center">
                <Tabs defaultValue="tree" className="w-auto">
                    <TabsList className="grid grid-cols-3 h-8">
                        <TabsTrigger value="text" className="h-6 px-2 text-xs">text</TabsTrigger>
                        <TabsTrigger value="tree" className="h-6 px-2 text-xs">tree</TabsTrigger>
                        <TabsTrigger value="table" className="h-6 px-2 text-xs">table</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="h-5 border-l mx-2"></div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFormat}><AlignLeft className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Format</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSort}><ArrowDownUp className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Sort</p></TooltipContent>
                    </Tooltip>
                    <div className="h-5 border-l mx-2"></div>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" disabled><Filter className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Filter (coming soon)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" disabled><Search className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>Search (coming soon)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" disabled><MoreVertical className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>More actions (coming soon)</p></TooltipContent>
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
            <div className="flex items-center">
                <TooltipProvider>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Open in new window (coming soon)</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
