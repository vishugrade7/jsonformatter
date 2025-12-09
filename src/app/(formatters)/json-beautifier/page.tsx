import { FormatterView } from '@/components/formatter-view';

export default function JsonBeautifierPage() {
  return (
    <FormatterView
      language="json"
      title="JSON Beautifier"
      description="Format your JSON into a human-readable, indented structure."
    />
  );
}
