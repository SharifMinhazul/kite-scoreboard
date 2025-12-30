import { IMatch } from "@/models/Match";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: IMatch;
  orientation?: "left" | "right" | "center";
  showConnector?: boolean;
}

export function MatchCard({ match, orientation = "center", showConnector = false }: MatchCardProps) {
  const winner = match.score1 !== null && match.score2 !== null && match.score1 !== match.score2
    ? (match.score1 > match.score2 ? match.player1 : match.player2)
    : null;

  const isPlayer1Winner = winner === match.player1;
  const isPlayer2Winner = winner === match.player2;

  return (
    <div className="relative">
      <Card
        className={cn(
          "p-4 min-w-[200px] border-2 transition-all duration-300",
          match.status === "live" && "border-secondary animate-pulse-slow",
          match.status === "completed" && "border-muted",
          match.status === "scheduled" && "border-border"
        )}
      >
        {/* Match Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono text-muted-foreground">{match.id}</span>
          <Badge
            variant={
              match.status === "completed"
                ? "default"
                : match.status === "live"
                ? "destructive"
                : "outline"
            }
            className={cn(
              "text-[10px]",
              match.status === "live" && "animate-pulse"
            )}
          >
            {match.status.toUpperCase()}
          </Badge>
        </div>

        {/* Players */}
        <div className="space-y-2">
          {/* Player 1 */}
          <div
            className={cn(
              "flex justify-between items-center p-2 rounded-md transition-all",
              isPlayer1Winner && "bg-primary/20 border border-primary",
              !match.player1 && "bg-muted/50"
            )}
          >
            <span
              className={cn(
                "font-medium truncate",
                isPlayer1Winner && "text-primary font-bold",
                !match.player1 && "text-muted-foreground italic"
              )}
            >
              {match.player1 || "TBD"}
            </span>
            {match.score1 !== null && (
              <span
                className={cn(
                  "ml-2 font-bold text-lg",
                  isPlayer1Winner && "text-primary"
                )}
              >
                {match.score1}
              </span>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center text-[10px] text-muted-foreground font-bold">VS</div>

          {/* Player 2 */}
          <div
            className={cn(
              "flex justify-between items-center p-2 rounded-md transition-all",
              isPlayer2Winner && "bg-primary/20 border border-primary",
              !match.player2 && "bg-muted/50"
            )}
          >
            <span
              className={cn(
                "font-medium truncate",
                isPlayer2Winner && "text-primary font-bold",
                !match.player2 && "text-muted-foreground italic"
              )}
            >
              {match.player2 || "TBD"}
            </span>
            {match.score2 !== null && (
              <span
                className={cn(
                  "ml-2 font-bold text-lg",
                  isPlayer2Winner && "text-primary"
                )}
              >
                {match.score2}
              </span>
            )}
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-center text-primary font-bold animate-pulse">
              🏆 {winner} Wins!
            </p>
          </div>
        )}
      </Card>

      {/* Connector Line (optional) */}
      {showConnector && (
        <div
          className={cn(
            "absolute top-1/2 w-8 h-[2px] bg-border",
            orientation === "left" && "right-0 translate-x-full",
            orientation === "right" && "left-0 -translate-x-full"
          )}
        />
      )}
    </div>
  );
}
