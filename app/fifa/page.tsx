import { getAllMatches } from "@/app/actions/match-actions";
import { TournamentBracket } from "@/components/bracket/TournamentBracket";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 30; // Revalidate every 30 seconds

export default async function FifaBracketPage({
  searchParams,
}: {
  searchParams: Promise<{ slideshow?: string }>;
}) {
  const params = await searchParams;
  const isSlideshow = params.slideshow === 'true';
  const result = await getAllMatches();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-destructive">Error Loading Bracket</h1>
          <p className="text-xl text-muted-foreground mb-6">{result.message}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Make sure MongoDB is running and the database is seeded.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/admin/fifa">Go to Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      {!isSlideshow && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/fifa/groups">Groups</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/fifa">Admin</Link>
          </Button>
        </div>
      )}

      {/* Tournament Bracket */}
      <TournamentBracket matches={result.data} />
    </div>
  );
}
