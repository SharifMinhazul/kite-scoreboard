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
          "p-4 min-w-[200px] border-2 transition-all duration-300 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden",
          match.status === "live" && "border-secondary shadow-[0_0_20px_rgba(255,0,128,0.3)]",
          match.status === "completed" && "border-primary/30",
          match.status === "scheduled" && "border-border"
        )}
      >
        {/* Top accent bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-0.5",
          match.status === "live" && "bg-secondary",
          match.status === "completed" && "bg-primary",
          match.status === "scheduled" && "bg-muted"
        )}></div>

        {/* Match Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-display tracking-wider text-muted-foreground">{match.id}</span>
          <Badge
            variant={
              match.status === "completed"
                ? "default"
                : match.status === "live"
                ? "destructive"
                : "outline"
            }
            className={cn(
              "text-[9px] font-display tracking-wider",
              match.status === "live" && "bg-secondary electric-pulse",
              match.status === "completed" && "bg-primary"
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
          <div className="text-center text-[10px] text-muted-foreground font-display tracking-widest">VS</div>

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
          <div className="mt-3 pt-3 border-t border-primary/30">
            <p className="text-[10px] text-center text-primary font-display tracking-wider electric-pulse">
              WINNER: {winner.toUpperCase()}
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
