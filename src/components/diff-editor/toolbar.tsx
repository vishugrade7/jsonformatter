'use client';

import { 
    ChevronDown,
    Split,
    Rows
} from "lucide-react";
import { Button } from "../ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Language } from "@/lib/language-detect";

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
        <div className="flex items-center justify-between p-1 border-b border-border bg-background/60 backdrop-blur-lg">
            <div className="flex items-center">
                 <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
                    <SelectTrigger className="w-[120px] rounded-full h-8 text-sm">
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
                <Button variant={viewMode === 'split' ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-full" onClick={() => onViewModeChange('split')}>
                    <Split className="h-4 w-4" />
                </Button>
                 <Button variant={viewMode === 'unified' ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-full" onClick={() => onViewModeChange('unified')}>
                    <Rows className="h-4 w-4" />
                </Button>
            </div>


            <div className="flex items-center w-[120px]">
               
            </div>
        </div>
    );
}
