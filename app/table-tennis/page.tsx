import { getAllTTMatches } from "@/app/actions/table-tennis-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 5; // Revalidate every 5 seconds

interface MatchCardProps {
  match: {
    id: string;
    player1: string | null;
    player2: string | null;
    score1: number | null;
    score2: number | null;
    status: string;
  };
}

function MatchCard({ match }: MatchCardProps) {
  const winner =
    match.score1 !== null && match.score2 !== null
      ? match.score1 > match.score2
        ? match.player1
        : match.player2
      : null;

  return (
    <Card
      className={`border-2 transition-all ${
        match.status === "completed"
          ? "border-primary/30"
          : match.status === "live"
          ? "border-destructive animate-pulse"
          : "border-muted"
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Player 1 */}
          <div
            className={`flex justify-between items-center p-3 rounded-lg ${
              winner === match.player1
                ? "bg-primary/20 border-2 border-primary"
                : "bg-muted/50"
            }`}
          >
            <span className="font-medium truncate">
              {match.player1 || "TBD"}
            </span>
            <span className="text-xl font-bold ml-2">
              {match.score1 !== null ? match.score1 : "-"}
            </span>
          </div>

          {/* Player 2 */}
          <div
            className={`flex justify-between items-center p-3 rounded-lg ${
              winner === match.player2
                ? "bg-primary/20 border-2 border-primary"
                : "bg-muted/50"
            }`}
          >
            <span className="font-medium truncate">
              {match.player2 || "TBD"}
            </span>
            <span className="text-xl font-bold ml-2">
              {match.score2 !== null ? match.score2 : "-"}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center pt-1">
            {match.status === "completed" && (
              <Badge variant="outline" className="text-xs">
                Completed
              </Badge>
            )}
            {match.status === "live" && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TableTennisPage() {
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

  // Group matches by round
  const r16Matches = matches.filter((m) => m.round === "R16");
  const qfMatches = matches.filter((m) => m.round === "QF");
  const sfMatches = matches.filter((m) => m.round === "SF");
  const finalMatches = matches.filter((m) => m.round === "Final");

  // Stats
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🏓 Table Tennis Tournament
            </h1>
            <p className="text-xl text-muted-foreground">Kite Games Studio</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link href="/">FIFA Bracket</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/groups">Groups</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dart">🎯 Dart</Link>
            </Button>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-4 flex-wrap">
          <Badge variant="outline" className="px-4 py-2">
            Total: {matches.length} matches
          </Badge>
          <Badge variant="default" className="px-4 py-2">
            Completed: {completedCount}
          </Badge>
          {liveCount > 0 && (
            <Badge variant="destructive" className="px-4 py-2 animate-pulse">
              Live: {liveCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Bracket - Horizontal Layout */}
      <div className="max-w-7xl mx-auto overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-w-[800px]">
          {/* Round of 16 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 sticky top-0 bg-background/95 py-2 z-10">
              Round of 16
              <Badge variant="outline" className="ml-2">
                {r16Matches.length}
              </Badge>
            </h2>
            {r16Matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {/* Quarter Finals */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 sticky top-0 bg-background/95 py-2 z-10">
              Quarter Finals
              <Badge variant="outline" className="ml-2">
                {qfMatches.length}
              </Badge>
            </h2>
            {qfMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {/* Semi Finals */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 sticky top-0 bg-background/95 py-2 z-10">
              Semi Finals
              <Badge variant="outline" className="ml-2">
                {sfMatches.length}
              </Badge>
            </h2>
            {sfMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {/* Final */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 sticky top-0 bg-background/95 py-2 z-10">
              🏆 Final
            </h2>
            {finalMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-12 p-6 bg-card rounded-lg border">
        <h3 className="font-bold mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Auto-Advance:</strong> When a match is completed, the winner automatically
            advances to the next round
          </div>
          <div>
            <strong>Structure:</strong> 16 players → R16 (8 matches) → QF (4) → SF (2) → Final (1)
          </div>
        </div>
      </div>
    </div>
  );
}
