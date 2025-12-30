import { getAllMatches } from "@/app/actions/match-actions";
import { ScoreInput } from "@/components/admin/ScoreInput";
import { MatchTable } from "@/components/admin/MatchTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0; // Always fetch fresh data for admin

export default async function AdminPage() {
  const result = await getAllMatches();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Matches</h1>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p>Make sure:</p>
            <ul className="list-disc list-inside text-left">
              <li>MongoDB is running locally or Atlas is configured</li>
              <li>The database has been seeded with `npm run seed`</li>
              <li>Environment variables are set correctly in `.env.local`</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/">Back to Bracket View</Link>
          </Button>
        </div>
      </div>
    );
  }

  const matches = result.data;

  // Group matches by round
  const r16Matches = matches.filter((m) => m.round === "R16");
  const qfMatches = matches.filter((m) => m.round === "QF");
  const sfMatches = matches.filter((m) => m.round === "SF");
  const finalMatches = matches.filter((m) => m.round === "Final");
  const thirdPlaceMatches = matches.filter((m) => m.round === "3rdPlace");

  // Stats
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const liveCount = matches.filter((m) => m.status === "live").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage tournament matches and scores</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/setup">Add Players</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">View Bracket</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="outline" className="px-4 py-2">
            Total: {matches.length}
          </Badge>
          <Badge variant="default" className="px-4 py-2">
            Completed: {completedCount}
          </Badge>
          <Badge variant="destructive" className="px-4 py-2">
            Live: {liveCount}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            Scheduled: {scheduledCount}
          </Badge>
        </div>
      </div>

      {/* Match Input Grids by Round */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Round of 16 */}
        {r16Matches.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              Round of 16
              <Badge variant="outline">{r16Matches.length} matches</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {r16Matches.map((match) => (
                <ScoreInput key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Quarter Finals */}
        {qfMatches.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              Quarter Finals
              <Badge variant="outline">{qfMatches.length} matches</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {qfMatches.map((match) => (
                <ScoreInput key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Semi Finals */}
        {sfMatches.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              Semi Finals
              <Badge variant="outline">{sfMatches.length} matches</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sfMatches.map((match) => (
                <ScoreInput key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Final & 3rd Place */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Championship Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {finalMatches.map((match) => (
              <ScoreInput key={match.id} match={match} />
            ))}
            {thirdPlaceMatches.map((match) => (
              <ScoreInput key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* Table View */}
        <section>
          <h2 className="text-2xl font-bold mb-4">All Matches (Table View)</h2>
          <MatchTable matches={matches} />
        </section>
      </div>
    </div>
  );
}
