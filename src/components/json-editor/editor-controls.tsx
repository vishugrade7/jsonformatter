'use client';

import {
  Upload,
  ShieldCheck,
  Download,
  ArrowRightLeft,
  Trash2,
  Minimize,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Checkbox } from '../ui/checkbox';

interface EditorControlsProps {
  onUpload: (content: string) => void;
  onValidate: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onDownload: (side: 'left' | 'right') => void;
  onCompare: (isComparing: boolean) => void;
  isComparing: boolean;
  indent: string;
  onIndentChange: (value: string) => void;
  onCopyLeftToRight: () => void;
  onCopyRightToLeft: () => void;
  onClear: () => void;
}

export function EditorControls({
  onUpload,
  onValidate,
  onFormat,
  onMinify,
  onDownload,
  onCompare,
  isComparing,
  indent,
  onIndentChange,
  onCopyLeftToRight,
  onCopyRightToLeft,
  onClear,
}: EditorControlsProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onUpload(content);
      };
      reader.readAsText(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-card/80 border-x">
      <div className="flex flex-col space-y-2 w-40">
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload Data
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button variant="outline" onClick={onValidate}>
          <ShieldCheck className="mr-2 h-4 w-4" /> Validate
        </Button>

        <Select value={indent} onValueChange={onIndentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select indent space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Tab Space</SelectItem>
            <SelectItem value="4">4 Tab Space</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onFormat}>
          Format / Beautify
        </Button>
      </div>

      <div className="flex items-center space-x-2 my-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopyLeftToRight}
              >
                <div className="text-xs font-bold uppercase text-muted-foreground">
                  Copy
                </div>
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy left to right</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col space-y-2 w-40">
        <Button variant="outline" onClick={onMinify}>
          <Minimize className="mr-2 h-4 w-4" /> Minify / Compact
        </Button>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Convert JSON to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xml" disabled>XML (coming soon)</SelectItem>
            <SelectItem value="csv" disabled>CSV (coming soon)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => onDownload('left')}
        >
          <Download className="mr-2 h-4 w-4" /> Download Left
        </Button>
         <Button
          variant="outline"
          onClick={() => onDownload('right')}
        >
          <Download className="mr-2 h-4 w-4" /> Download Right
        </Button>
      </div>
      
      <div className="border-t w-full my-4"></div>

      <div className="flex flex-col space-y-2 items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="compare" checked={isComparing} onCheckedChange={(checked) => onCompare(Boolean(checked))} />
            <label
                htmlFor="compare"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
                Compare
            </label>
        </div>
        <Button variant="destructive" onClick={onClear}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>
    </div>
  );
}
