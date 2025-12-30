import { IMatch, Round } from "@/models/Match";
import { MatchCard } from "./MatchCard";
import { cn } from "@/lib/utils";

interface RoundColumnProps {
  round: Round;
  matches: IMatch[];
  orientation?: "left" | "right" | "center";
  showConnectors?: boolean;
}

const ROUND_LABELS: Record<Round, string> = {
  R16: "Round of 16",
  QF: "Quarter Finals",
  SF: "Semi Finals",
  Final: "Final",
  "3rdPlace": "3rd Place",
};

export function RoundColumn({
  round,
  matches,
  orientation = "center",
  showConnectors = false,
}: RoundColumnProps) {
  // Calculate spacing based on round
  // R16: minimal spacing, QF: 2x, SF: 4x, Final: centered
  const getSpacingClass = () => {
    switch (round) {
      case "R16":
        return "gap-3";
      case "QF":
        return "gap-6";
      case "SF":
        return "gap-12";
      case "Final":
      case "3rdPlace":
        return "gap-0";
      default:
        return "gap-4";
    }
  };

  // Sort matches by position
  const sortedMatches = [...matches].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col h-full">
      {/* Round Label */}
      <div className="mb-6 text-center">
        <h3
          className={cn(
            "text-sm font-bold uppercase tracking-wider",
            round === "Final" && "text-primary text-lg",
            round === "3rdPlace" && "text-secondary text-sm"
          )}
        >
          {ROUND_LABELS[round]}
        </h3>
        <div className="mt-1 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Matches Container */}
      <div
        className={cn(
          "flex flex-col justify-center flex-1",
          getSpacingClass()
        )}
      >
        {sortedMatches.length > 0 ? (
          sortedMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              orientation={orientation}
              showConnector={showConnectors}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground text-sm italic">
            No matches
          </div>
        )}
      </div>
    </div>
  );
}
