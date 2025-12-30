import { getAllTTMatches } from "@/app/actions/table-tennis-actions";
import { TTTournamentBracket } from "@/components/bracket/TTTournamentBracket";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function TableTennisPage({
  searchParams,
}: {
  searchParams: { slideshow?: string };
}) {
  const isSlideshow = searchParams.slideshow === 'true';
  const result = await getAllTTMatches();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Bracket</h1>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p>Make sure:</p>
            <ul className="list-disc list-inside text-left">
              <li>MongoDB is running</li>
              <li>Run: npm run seed-table-tennis</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/admin/table-tennis">Go to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  const matches = result.data;

  return (
    <div>
      {/* Navigation */}
      {!isSlideshow && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/table-tennis/groups">Groups</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/table-tennis">Admin</Link>
          </Button>
        </div>
      )}

      {/* Bracket */}
      <TTTournamentBracket matches={matches} />
    </div>
  );
}
