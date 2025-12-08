'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JsonTreeView } from '@/components/json-tree-view';
import { useToast } from '@/hooks/use-toast';
import { Share2, Trash2 } from 'lucide-react';

export function JsonParserView() {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const parsedJson = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return JSON.parse(input);
    } catch (error) {
      return { error: 'Invalid JSON' };
    }
  }, [input]);

  const handleParse = useCallback(() => {
    if (parsedJson?.error) {
      toast({
        title: 'Invalid JSON',
        description: 'Could not parse JSON. Please check for syntax errors.',
        variant: 'destructive',
      });
    } else if (!input.trim()) {
        toast({
            title: 'Input is empty',
            description: 'Please provide JSON data to parse.',
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'JSON Parsed Successfully!',
            description: 'The JSON tree has been generated.',
        });
    }
  }, [input, parsedJson, toast]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Input</CardTitle>
            <CardDescription>Paste your JSON to parse it.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleParse}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Parse</span>
            </Button>
            <Button variant="destructive" size="icon" onClick={handleClear}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your JSON code here..."
            className="min-h-[400px] font-code text-sm resize-none"
            aria-label="JSON Input"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tree View</CardTitle>
          <CardDescription>An interactive view of your JSON data.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border bg-muted/50 p-4">
            {input.trim() ? (
              parsedJson && parsedJson.error ? (
                <div className="text-destructive font-medium">Invalid JSON provided.</div>
              ) : (
                <JsonTreeView data={parsedJson} />
              )
            ) : (
              <div className="text-muted-foreground">Tree view will appear here...</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
