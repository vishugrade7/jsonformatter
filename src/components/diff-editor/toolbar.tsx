'use client';

import { 
    Split,
    Rows
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Language } from "@/lib/language-detect";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export type ViewMode = 'split' | 'unified';

interface ToolbarProps {
    onViewModeChange: (mode: ViewMode) => void;
    viewMode: ViewMode;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export function Toolbar({ 
    onViewModeChange,
    viewMode,
    language,
    onLanguageChange,
}: ToolbarProps) {
    return (
        <div className="flex items-center justify-between p-1 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center w-[150px]">
                 <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
                    <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={viewMode === 'split' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => onViewModeChange('split')}>
                                <Split className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Side-by-side</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={viewMode === 'unified' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => onViewModeChange('unified')}>
                                <Rows className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Inline</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>


            <div className="flex items-center w-[150px]">
               {/* Spacer */}
            </div>
        </div>
    );
}
