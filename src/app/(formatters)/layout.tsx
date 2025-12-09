
export default function FormattersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-4 md:py-8 max-w-full">
      <div className="mt-4 md:mt-6">
        {children}
      </div>
    </div>
  );
}
