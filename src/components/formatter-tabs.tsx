'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'json-editor', label: 'JSON Editor' },
  { value: 'json-beautifier', label: 'JSON Beautifier' },
  { value: 'json-parser', label: 'JSON Parser' },
  { value: 'xml-formatter', label: 'XML Formatter' },
  { value: 'js-beautifier', label: 'JS Beautifier' },
];

export function FormatterTabs() {
  const pathname = usePathname();
  const router = useRouter();
  
  const currentTab = pathname.substring(1);

  const onTabChange = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="mt-8 w-full flex justify-center">
      <TabsList className="grid w-full max-w-2xl grid-cols-2 h-auto md:grid-cols-5 md:h-10">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
