'use client';

import { 
    Split,
    Rows,
    Upload,
    Trash2,
    GitCompareArrows,
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
import { Separator } from "../ui/separator";

export type ViewMode = 'split' | 'unified';

interface ToolbarProps {
    onViewModeChange: (mode: ViewMode) => void;
    viewMode: ViewMode;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    onUpload: (content: string, side: 'left' | 'right') => void;
    onClear: () => void;
    onSwap: () => void;
}

export function Toolbar({ 
    onViewModeChange,
    viewMode,
    language,
    onLanguageChange,
    onUpload,
    onClear,
    onSwap,
}: ToolbarProps) {

    const createChangeHandler = (side: 'left' | 'right') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            onUpload(content, side);
          };
          reader.readAsText(file);
        }
        event.target.value = '';
      };

    return (
        <div className="flex items-center justify-between p-1 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 px-4 gap-4">
            <div className="flex items-center gap-2">
                 <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
                    <SelectTrigger className="w-full h-10 text-sm md:w-[130px] rounded-full">
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
            
            <div className="flex-1 flex items-center justify-end md:justify-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full" onClick={() => document.getElementById('left-file-upload')?.click()}>
                              <Upload className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Upload Left</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <input
                id="left-file-upload"
                type="file"
                onChange={createChangeHandler('left')}
                className="hidden"
                />
                
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full" onClick={onSwap}>
                                <GitCompareArrows className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Swap</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full" onClick={() => document.getElementById('right-file-upload')?.click()}>
                              <Upload className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Upload Right</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <input
                    id="right-file-upload"
                    type="file"
                    onChange={createChangeHandler('right')}
                    className="hidden"
                />

                <Separator orientation="vertical" className="h-6 mx-2" />

                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" className="rounded-full" onClick={onClear}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Clear All</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>


            <div className="flex items-center justify-end w-auto md:w-[130px]">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={viewMode === 'split' ? "secondary" : "ghost"} size="icon" className="rounded-full" onClick={() => onViewModeChange('split')}>
                                <Split className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Side-by-side</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={viewMode === 'unified' ? "secondary" : "ghost"} size="icon" className="rounded-full" onClick={() => onViewModeChange('unified')}>
                                <Rows className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Inline</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
