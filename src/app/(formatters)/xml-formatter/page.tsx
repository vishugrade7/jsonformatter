import { redirect } from 'next/navigation';

export default function XMLFormatterPage() {
  // Redirect to the new, more advanced XML editor
  redirect('/xml-editor');
}
