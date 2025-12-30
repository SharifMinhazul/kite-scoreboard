import { IMatch } from "@/models/Match";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatchTableProps {
  matches: IMatch[];
}

export function MatchTable({ matches }: MatchTableProps) {
  // Sort matches by round, side, and position
  const sortedMatches = [...matches].sort((a, b) => {
    const roundOrder = { R16: 1, QF: 2, SF: 3, Final: 4, "3rdPlace": 5 };
    if (roundOrder[a.round] !== roundOrder[b.round]) {
      return roundOrder[a.round] - roundOrder[b.round];
    }
    if (a.side !== b.side) {
      return a.side.localeCompare(b.side);
    }
    return a.position - b.position;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[80px]">Round</TableHead>
            <TableHead>Player 1</TableHead>
            <TableHead className="w-[60px] text-center">Score</TableHead>
            <TableHead>Player 2</TableHead>
            <TableHead className="w-[60px] text-center">Score</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Next Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMatches.map((match) => {
            const winner = match.score1 !== null && match.score2 !== null && match.score1 !== match.score2
              ? (match.score1 > match.score2 ? match.player1 : match.player2)
              : null;

            const isPlayer1Winner = winner === match.player1;
            const isPlayer2Winner = winner === match.player2;

            return (
              <TableRow
                key={match.id}
                className={cn(
                  match.status === "live" && "bg-secondary/10",
                  match.status === "completed" && "bg-muted/30"
                )}
              >
                <TableCell className="font-mono text-xs">{match.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">{match.round}</Badge>
                </TableCell>

                {/* Player 1 */}
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      isPlayer1Winner && "text-primary font-bold",
                      !match.player1 && "text-muted-foreground italic"
                    )}
                  >
                    {match.player1 || "TBD"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "font-bold",
                      isPlayer1Winner && "text-primary"
                    )}
                  >
                    {match.score1 ?? "-"}
                  </span>
                </TableCell>

                {/* Player 2 */}
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      isPlayer2Winner && "text-primary font-bold",
                      !match.player2 && "text-muted-foreground italic"
                    )}
                  >
                    {match.player2 || "TBD"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "font-bold",
                      isPlayer2Winner && "text-primary"
                    )}
                  >
                    {match.score2 ?? "-"}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={
                      match.status === "completed"
                        ? "default"
                        : match.status === "live"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {match.status}
                  </Badge>
                </TableCell>

                {/* Next Match */}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {match.nextMatchId || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {matches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No matches found
        </div>
      )}
    </div>
  );
}
