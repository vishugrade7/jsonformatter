'use client';

import { useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Trash2, ShieldCheck, FileCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format as prettierFormat } from 'prettier/standalone';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginXml from '@prettier/plugin-xml';
import prettierPluginBabel from 'prettier/plugins/babel';


interface FormatterViewProps {
  language: 'json' | 'javascript' | 'xml';
  title: string;
  description: string;
}

export function FormatterView({ language, title, description }: FormatterViewProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getPrettierParser = () => {
    switch (language) {
        case 'javascript': return 'babel';
        case 'json': return 'json';
        case 'xml': return 'xml';
        default: return 'babel';
    }
  }

  const handleFormat = useCallback(() => {
    if (!input) {
      toast({ title: 'Input is empty', description: 'Please enter some code to format.', variant: 'destructive' });
      return;
    }
    startTransition(async () => {
        try {
            const parser = getPrettierParser();
            const plugins = language === 'xml' ? [prettierPluginXml] : [prettierPluginBabel, prettierPluginEstree];
            
            const formatted = await prettierFormat(input, {
              parser,
              plugins,
              tabWidth: parseInt(indent, 10),
            });
            setOutput(formatted);
            toast({ title: 'Code Formatted', description: 'Your code has been successfully formatted.', variant: 'default' });
          } catch (error: any) {
            setOutput('');
            toast({ title: 'Formatting Error', description: `Could not format code. ${error.message}`, variant: 'destructive' });
          }
    });
  }, [input, language, indent, toast]);

  const handleValidate = useCallback(() => {
    if (!input) {
        toast({ title: 'Input is empty', description: 'Please enter some code to validate.', variant: 'destructive' });
        return;
    }
    startTransition(async () => {
        try {
            const parser = getPrettierParser();
            const plugins = language === 'xml' ? [prettierPluginXml] : [prettierPluginBabel, prettierPluginEstree];

            await prettierFormat(input, {
                parser,
                plugins,
                tabWidth: parseInt(indent, 10),
            });
            toast({ title: 'Validation Successful', description: `Your ${language.toUpperCase()} code is well-formed.`, variant: 'default' });
        } catch (error: any) {
            toast({ title: 'Validation Failed', description: `Your ${language.toUpperCase()} code has syntax errors.`, variant: 'destructive' });
        }
    });
  }, [input, language, indent, toast]);

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
            <Button variant="outline" onClick={handleValidate} disabled={isPending}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select indent space" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="2">2 Tab Space</SelectItem>
                    <SelectItem value="4">4 Tab Space</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleFormat} disabled={isPending}>
              <FileCheck className="h-4 w-4 mr-2" />
              Format
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
    </div>
  );
}
