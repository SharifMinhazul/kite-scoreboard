import { getDartTournament } from "@/app/actions/dart-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function DartScoreboardPage() {
  const result = await getDartTournament();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Tournament</h1>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p>Make sure:</p>
            <ul className="list-disc list-inside text-left">
              <li>MongoDB is running</li>
              <li>Run: npm run seed-dart</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/admin/dart">Go to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tournament = result.data;
  const allRounds = [...tournament.rounds].sort((a, b) => a.roundNumber - b.roundNumber);
  const currentRound = tournament.rounds.find((r) => r.roundNumber === tournament.currentRound);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎯 Dart Tournament
            </h1>
            <p className="text-xl text-muted-foreground">Kite Games Studio</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/dart">Admin</Link>
            </Button>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Tournament Status */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-4 flex-wrap items-center">
          <Badge variant="outline" className="px-4 py-2 text-lg">
            {tournament.isFinished ? "🏁 Tournament Finished" : `🎯 Round ${tournament.currentRound}`}
          </Badge>
          {currentRound && (
            <>
              <Badge variant="default" className="px-4 py-2">
                {currentRound.players.length} Players
              </Badge>
              {!tournament.isFinished && currentRound.players.length > 3 && (
                <Badge variant="secondary" className="px-4 py-2">
                  Top {Math.ceil(currentRound.players.length / 2)} Qualify
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rounds Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 flex-wrap">
          {allRounds.map((round) => (
            <a
              key={round.roundNumber}
              href={`#round-${round.roundNumber}`}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                round.roundNumber === tournament.currentRound
                  ? "bg-primary text-primary-foreground"
                  : round.isCompleted
                  ? "bg-muted text-muted-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Round {round.roundNumber}
            </a>
          ))}
        </div>
      </div>

      {/* Rounds Display */}
      <div className="max-w-7xl mx-auto space-y-8">
        {allRounds.map((round) => {
          const sortedPlayers = [...round.players].sort((a, b) => b.score - a.score);
          const qualifyCount = Math.ceil(round.players.length / 2);
          const qualifyThreshold = sortedPlayers[qualifyCount - 1]?.score || 0;

          return (
            <div key={round.roundNumber} id={`round-${round.roundNumber}`}>
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                      Round {round.roundNumber}
                      {round.isCompleted && (
                        <Badge variant="outline" className="text-sm">
                          Completed
                        </Badge>
                      )}
                      {round.isActive && !round.isCompleted && (
                        <Badge variant="default" className="text-sm animate-pulse">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {round.players.length} Player{round.players.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {round.players.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No players yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">Rank</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-center w-32">Score</TableHead>
                          <TableHead className="text-center w-24">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.map((player, index) => {
                          const isQualified = round.isCompleted && player.score >= qualifyThreshold;
                          const isEliminated = round.isCompleted && !isQualified;
                          const isTop3 = index < 3;

                          return (
                            <TableRow
                              key={player.name}
                              className={`${
                                isQualified
                                  ? "bg-primary/10 border-l-4 border-primary"
                                  : isEliminated
                                  ? "opacity-50"
                                  : ""
                              } ${isTop3 && round.isCompleted ? "font-bold" : ""}`}
                            >
                              <TableCell className="text-center font-mono text-lg">
                                {index === 0 && round.isCompleted ? (
                                  <span className="text-2xl">👑</span>
                                ) : index === 1 && round.isCompleted ? (
                                  <span className="text-2xl">🥈</span>
                                ) : index === 2 && round.isCompleted ? (
                                  <span className="text-2xl">🥉</span>
                                ) : (
                                  index + 1
                                )}
                              </TableCell>
                              <TableCell className="font-medium text-lg">
                                {player.name}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-2xl font-bold text-primary">
                                  {player.score}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {round.isCompleted ? (
                                  isQualified ? (
                                    <Badge variant="default" className="bg-primary">
                                      ✓ Qualified
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Eliminated</Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary">Playing</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {tournament.isFinished && (
        <div className="max-w-7xl mx-auto mt-12 p-6 bg-card rounded-lg border border-primary">
          <h3 className="font-bold text-xl mb-2 text-primary">🏆 Tournament Complete!</h3>
          <p className="text-muted-foreground">
            Congratulations to all participants! View the final standings above.
          </p>
        </div>
      )}
    </div>
  );
}
