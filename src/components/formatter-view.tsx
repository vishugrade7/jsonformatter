'use client';

import { useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAIFormattedCode, getAISuggestions } from '@/app/actions';
import { Copy, Download, Sparkles, Trash2, Wand2, X } from 'lucide-react';

interface FormatterViewProps {
  language: 'json' | 'javascript' | 'xml';
  title: string;
  description: string;
}

export function FormatterView({ language, title, description }: FormatterViewProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const { toast } = useToast();

  const handleFormat = useCallback(() => {
    if (!input) {
      toast({ title: 'Input is empty', description: 'Please enter some code to format.', variant: 'destructive' });
      return;
    }
    startTransition(() => {
      if (language === 'json') {
        try {
          const parsed = JSON.parse(input);
          setOutput(JSON.stringify(parsed, null, 2));
        } catch (error) {
          toast({ title: 'Invalid JSON', description: 'Could not parse JSON. Please check for syntax errors.', variant: 'destructive' });
        }
      } else {
        getAIFormattedCode({ code: input, language }).then(res => {
          if (res.error) {
            toast({ title: 'Formatting Error', description: res.error, variant: 'destructive' });
          } else {
            setOutput(res.data || '');
          }
        });
      }
    });
  }, [input, language, toast]);

  const handleAiSuggest = useCallback(() => {
    if (!input) {
      toast({ title: 'Input is empty', description: 'Please enter some code for AI suggestions.', variant: 'destructive' });
      return;
    }
    setIsAiSuggesting(true);
    startTransition(() => {
      getAISuggestions({ code: input, language }).then(res => {
        if (res.error) {
          toast({ title: 'AI Suggestion Error', description: res.error, variant: 'destructive' });
        } else if (res.data) {
          setOutput(res.data.formattedCode);
          setAiSuggestions(res.data.suggestions);
        }
      }).finally(() => setIsAiSuggesting(false));
    });
  }, [input, language, toast]);

  const handleCopy = useCallback(() => {
    if (!output) {
      toast({ title: 'Nothing to copy', description: 'The output is empty.', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(output);
    toast({ title: 'Copied to clipboard!' });
  }, [output, toast]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setAiSuggestions('');
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) {
        toast({ title: 'Nothing to download', description: 'The output is empty.', variant: 'destructive' });
        return;
    }
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = language === 'javascript' ? 'js' : language;
    link.download = `formatted.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Download started!' });
}, [output, language, toast]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Input</CardTitle>
            <CardDescription>{title}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleFormat} disabled={isPending}>
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">Format</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleAiSuggest} disabled={isPending}>
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">AI Suggestions</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste your ${language.toUpperCase()} code here...`}
            className="min-h-[400px] font-code text-sm resize-none"
            aria-label="Code Input"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Output</CardTitle>
                <CardDescription>Formatted and beautified code.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} disabled={!output || isPending}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload} disabled={!output || isPending}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={handleClear} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border bg-muted/50">
            {isPending ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <pre className="p-4 text-sm font-code whitespace-pre-wrap break-all">{output || 'Output will appear here...'}</pre>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {(isAiSuggesting || aiSuggestions) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Suggestions</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setAiSuggestions('')} disabled={isAiSuggesting}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Best-practice recommendations to improve your code.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAiSuggesting ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Suggestions</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {aiSuggestions}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
