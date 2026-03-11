import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">CardApp</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Create and share your virtual digital business card. One link for your contacts, socials, and more.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Demo: <Link href="/card/shubham" className="text-primary underline">cardapp.com/card/shubham</Link>
        </p>
      </div>
    </div>
  );
}
