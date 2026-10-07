import Link from 'next/link';
import { Button } from '@cbt/ui/components/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Kurulum tamam</h1>
      <Button asChild variant="outline">
        <Link href="/admin">Admin</Link>
      </Button>
    </main>
  );
}
