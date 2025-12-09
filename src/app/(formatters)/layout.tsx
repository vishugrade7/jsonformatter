import { FormatterTabs } from '@/components/formatter-tabs';

export default function FormattersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8 max-w-full">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold tracking-tight text-center font-headline">
          Format, Parse, and Beautify Your Code
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-center max-w-2xl">
          A suite of tools to make your JSON, XML, and JavaScript code clean, readable, and well-structured.
        </p>
      </div>
      <FormatterTabs />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
