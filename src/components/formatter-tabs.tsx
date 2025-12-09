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
  { value: 'json-beautifier', label: 'JSON Beautifier' },
  { value: 'json-parser', label: 'JSON Parser' },
  { value: 'js-beautifier', label: 'JS Beautifier' },
];

export function FormatterTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const currentTab = pathname.substring(1);

  const onTabChange = (value: string) => {
    if (value === 'xml-formatter') {
        router.push('/xml-editor');
    } else {
        router.push(`/${value}`);
    }
  };
  
  const displayTab = currentTab === 'xml-formatter' ? 'xml-editor' : currentTab;

  if (isMobile) {
    return (
      <Select value={displayTab} onValueChange={onTabChange}>
        <SelectTrigger className="w-[150px]">
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
    <Tabs value={displayTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="hidden md:grid w-full max-w-2xl grid-cols-5 h-10">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value.replace('xml-formatter', 'xml-editor')}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
