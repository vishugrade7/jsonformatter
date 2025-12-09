'use client';

import {
  Upload,
  ShieldCheck,
  Download,
  ArrowRightLeft,
  Trash2,
  Minimize,
  FileText,
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

interface EditorControlsProps {
  onUpload: (content: string) => void;
  onValidate: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onDownload: (side: 'left' | 'right') => void;
  indent: string;
  onIndentChange: (value: string) => void;
  onCopyLeftToRight: () => void;
  onCopyRightToLeft: () => void;
  onClear: () => void;
  onConvert: (format: 'json') => void;
  onLoadSample: () => void;
}

export function EditorControls({
  onUpload,
  onValidate,
  onFormat,
  onMinify,
  onDownload,
  indent,
  onIndentChange,
  onCopyLeftToRight,
  onCopyRightToLeft,
  onClear,
  onConvert,
  onLoadSample,
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
    event.target.value = '';
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-card/80 border-y md:border-y-0 md:border-x">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2 w-full md:w-40">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={() => document.getElementById('file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Upload a file from your computer</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <input
          id="file-upload"
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="hidden"
        />

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onLoadSample}>
                        <FileText className="mr-2 h-4 w-4" /> Sample
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Load sample XML data</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onValidate}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Validate
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Validate the XML syntax</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Select value={indent} onValueChange={onIndentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select indent space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Tab Space</SelectItem>
            <SelectItem value="4">4 Tab Space</SelectItem>
          </SelectContent>
        </Select>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onFormat}>
                        Format
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Format the XML in the left editor and show the output in the right</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onMinify}>
                      <Minimize className="mr-2 h-4 w-4" /> Minify
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Remove whitespace to compact the XML</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Select onValueChange={(value) => onConvert(value as 'json')}>
          <SelectTrigger>
            <SelectValue placeholder="Convert XML to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => onDownload('left')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Left
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Download the content of the left editor</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => onDownload('right')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Right
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Download the content of the right editor</p></TooltipContent>
            </Tooltip>
         </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2 my-2 md:my-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopyLeftToRight}
                className="hidden md:inline-flex"
              >
                <ArrowRightLeft className="h-4 w-4 -rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy left to right</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopyRightToLeft}
                className="hidden md:inline-flex"
              >
                <ArrowRightLeft className="h-4 w-4 rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy right to left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="border-t w-full my-2 md:my-4"></div>

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
