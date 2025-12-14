'use client';

import {
  Upload,
  Trash2,
  GitCompareArrows,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Separator } from '../ui/separator';

interface EditorControlsProps {
  onUpload: (content: string, side: 'left' | 'right') => void;
  onClear: () => void;
  onSwap: () => void;
}

export function EditorControls({
  onUpload,
  onClear,
  onSwap,
}: EditorControlsProps) {

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
    <div className="flex flex-col justify-center items-center p-4 bg-card/80 border-y md:border-y-0 md:border-x">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2 w-full md:w-40">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={() => document.getElementById('left-file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Left
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Upload a file to the left editor</p></TooltipContent>
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
                    <Button onClick={() => document.getElementById('right-file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Right
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Upload a file to the right editor</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <input
          id="right-file-upload"
          type="file"
          onChange={createChangeHandler('right')}
          className="hidden"
        />

        <Separator className='my-2 col-span-2 md:col-span-1' />
        
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onSwap}>
                        <GitCompareArrows className="mr-2 h-4 w-4" /> Swap
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Swap the content of the editors</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

      </div>
      
      <div className="border-t w-full my-4 md:my-4"></div>

      <div className="flex flex-col space-y-2 items-center w-full md:w-auto">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" onClick={onClear} className="w-full md:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Clear both editors</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
