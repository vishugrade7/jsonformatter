import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { FormatterTabs } from './formatter-tabs';

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary">
                <rect width="256" height="256" fill="none"></rect>
                <path d="M75.3,48.3a12,12,0,0,0-10.6,10.6l-32,128a12,12,0,0,0,21.2,13.8L64,176h64l10.1,24.7a12,12,0,0,0,21.2-13.8l-32-128A12,12,0,0,0,116.7,48.3ZM98.8,112,112,77.2,125.2,112Z" fill="currentColor"></path>
                <path d="M228,128a12,12,0,0,1-12,12H188v28a12,12,0,0,1-24,0V140H140a12,12,0,0,1,0-24h24V88a12,12,0,0,1,24,0v28h28A12,12,0,0,1,228,128Z" fill="currentColor"></path>
            </svg>
            <span className="font-bold font-headline">Formatastic</span>
          </Link>
          <FormatterTabs />
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
