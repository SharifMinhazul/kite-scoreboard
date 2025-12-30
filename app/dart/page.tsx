import { getDartTournament } from "@/app/actions/dart-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function DartScoreboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slideshow?: string }>;
}) {
  const params = await searchParams;
  const isSlideshow = params.slideshow === 'true';
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
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-secondary to-transparent z-50"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-accent to-transparent z-50"></div>

      {/* Navigation */}
      {!isSlideshow && (
        <div className="fixed top-6 right-6 z-50 flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-display">
            <Link href="/">HOME</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="bg-secondary hover:bg-secondary/90 font-display">
            <Link href="/admin/dart">ADMIN ACCESS</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 broadcast-title">
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <div className="text-xs font-display tracking-[0.3em] text-secondary mb-2">SURVIVAL MODE • ELIMINATION ROUNDS</div>
            <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-primary">
              DART
            </span>
            <span className="block text-foreground mt-1">
              CHALLENGE
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-12 bg-secondary"></div>
            <div className="electric-pulse w-3 h-3 bg-secondary rounded-full"></div>
            <p className="text-[10px] font-display tracking-widest text-muted-foreground">
              KITE GAMES STUDIO
            </p>
            <div className="electric-pulse w-3 h-3 bg-secondary rounded-full"></div>
            <div className="h-px w-12 bg-secondary"></div>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent" />
      </div>

      {/* Tournament Status */}
      <div className="max-w-7xl mx-auto mb-8 broadcast-wipe stagger-1">
        <div className="flex gap-4 flex-wrap items-center justify-center">
          <Badge variant="outline" className="px-5 py-2.5 text-sm font-display tracking-wider border-secondary">
            {tournament.isFinished ? "TOURNAMENT COMPLETE" : `ROUND ${tournament.currentRound} ACTIVE`}
          </Badge>
          {currentRound && (
            <>
              <Badge variant="default" className="px-5 py-2.5 bg-secondary font-display tracking-wider">
                {currentRound.players.length} COMPETITORS
              </Badge>
              {!tournament.isFinished && currentRound.players.length > 3 && (
                <Badge variant="outline" className="px-5 py-2.5 border-accent text-accent font-display tracking-wider">
                  TOP {Math.ceil(currentRound.players.length / 2)} ADVANCE
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rounds Tabs */}
      <div className="max-w-7xl mx-auto mb-8 broadcast-wipe stagger-2">
        <div className="flex gap-3 flex-wrap justify-center">
          {allRounds.map((round) => (
            <a
              key={round.roundNumber}
              href={`#round-${round.roundNumber}`}
              className={`px-6 py-2.5 font-display tracking-wider text-sm transition-all border-2 ${
                round.roundNumber === tournament.currentRound
                  ? "bg-secondary text-background border-secondary shadow-[0_0_20px_rgba(255,0,128,0.5)]"
                  : round.isCompleted
                  ? "bg-muted/30 text-muted-foreground border-muted"
                  : "bg-transparent text-secondary border-secondary/50 hover:border-secondary"
              }`}
            >
              ROUND {round.roundNumber}
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
            <div key={round.roundNumber} id={`round-${round.roundNumber}`} className={`broadcast-wipe stagger-${Math.min(round.roundNumber, 5)}`}>
              <Card className="border-2 border-secondary/30 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>

                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                        ROUND {round.roundNumber}
                      </span>
                      {round.isCompleted && (
                        <Badge variant="outline" className="text-xs font-display border-muted-foreground">
                          COMPLETE
                        </Badge>
                      )}
                      {round.isActive && !round.isCompleted && (
                        <Badge variant="default" className="text-xs font-display bg-secondary electric-pulse">
                          LIVE
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-sm font-display text-muted-foreground tracking-wider">
                      {round.players.length} PLAYERS
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
        <div className="max-w-7xl mx-auto mt-12 p-8 bg-card/50 backdrop-blur-sm stripe-pattern border-2 border-secondary relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-t-2 border-l-2 border-secondary/30"></div>

          <div className="text-center">
            <h3 className="font-bold text-3xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-primary">
              TOURNAMENT COMPLETE
            </h3>
            <p className="text-sm font-display tracking-wider text-muted-foreground">
              ALL ROUNDS FINISHED • FINAL STANDINGS CONFIRMED
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
