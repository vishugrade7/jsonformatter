'use client';

import { ArrowLeftRight, ChevronLeft, ChevronRight, Copy, Diff } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EditorControlsProps {
    onCopyLeftToRight: () => void;
    onCopyRightToLeft: () => void;
    onCompare: (isComparing: boolean) => void;
    isComparing: boolean;
}

export function EditorControls({ onCopyLeftToRight, onCopyRightToLeft, onCompare, isComparing }: EditorControlsProps) {
    return (
        <Card className="flex flex-col justify-center items-center p-4 bg-card/80 border-0 shadow-none">
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground">Copy</div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onCopyLeftToRight}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy left to right</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onCopyRightToLeft}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy right to left</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground">Transform</div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Transform (coming soon)</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Transform (coming soon)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>_
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground">Differences</div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="compare" checked={isComparing} onCheckedChange={(checked) => onCompare(Boolean(checked))} />
                        <label
                            htmlFor="compare"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Compare
                        </label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
