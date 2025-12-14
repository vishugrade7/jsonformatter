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

const tabs = [
  { value: 'json-editor', label: 'JSON Editor' },
  { value: 'xml-editor', label: 'XML Editor' },
  { value: 'js-beautifier', label: 'JS Beautifier' },
  { value: 'code-compare', label: 'Code Compare' },
];

export function FormatterTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const currentTab = pathname.substring(1);

  const onTabChange = (value: string) => {
    router.push(`/${value}`);
  };
  
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
    <Tabs value={currentTab} onValueChange={onTabChange} className="hidden md:block">
      <TabsList className="grid w-full max-w-lg grid-cols-4 h-10 rounded-full">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} className="rounded-full">
            {tab.label.replace(' (Legacy)','')}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
