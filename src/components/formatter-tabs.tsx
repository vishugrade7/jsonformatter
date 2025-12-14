'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Code, GitCompare, Braces, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'json-editor', label: 'JSON Editor', icon: Braces },
  { value: 'xml-editor', label: 'XML Editor', icon: Code },
  { value: 'js-beautifier', label: 'JS Beautifier', icon: FileJson },
  { value: 'code-compare', label: 'Code Compare', icon: GitCompare },
];

export function FormatterTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const currentTab = pathname.substring(1);

  const onTabChange = (value: string) => {
    router.push(`/${value}`);
  };

  if (isMobile === null) return null;
  
  if (isMobile) {
    return (
      <Select value={currentTab} onValueChange={onTabChange}>
        <SelectTrigger className="w-[150px] md:hidden rounded-full">
          <SelectValue placeholder="Select a tool" />
        </SelectTrigger>
        <SelectContent>
          {tabs.map(tab => (
            <SelectItem key={tab.value} value={tab.value}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="md:block">
      <TabsList className="h-11 rounded-full bg-gray-800/80 p-1.5">
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className={cn(
              "rounded-full h-full px-4 text-gray-400 data-[state=active]:text-primary-foreground data-[state=active]:bg-primary",
              "flex items-center gap-2"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
