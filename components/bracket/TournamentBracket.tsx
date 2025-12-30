import { IMatch } from "@/models/Match";
import { RoundColumn } from "./RoundColumn";

interface TournamentBracketProps {
  matches: IMatch[];
}

export function TournamentBracket({ matches }: TournamentBracketProps) {
  // Filter matches by side
  const leftMatches = matches.filter((m) => m.side === "left");
  const rightMatches = matches.filter((m) => m.side === "right");
  const centerMatches = matches.filter((m) => m.side === "center");

  // Group left side by round
  const leftR16 = leftMatches.filter((m) => m.round === "R16");
  const leftQF = leftMatches.filter((m) => m.round === "QF");
  const leftSF = leftMatches.filter((m) => m.round === "SF");

  // Group right side by round
  const rightR16 = rightMatches.filter((m) => m.round === "R16");
  const rightQF = rightMatches.filter((m) => m.round === "QF");
  const rightSF = rightMatches.filter((m) => m.round === "SF");

  // Center matches
  const finalMatch = centerMatches.filter((m) => m.round === "Final");
  const thirdPlaceMatch = centerMatches.filter((m) => m.round === "3rdPlace");

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Kite Games Studio
        </h1>
        <h2 className="text-xl md:text-2xl text-muted-foreground">
          FIFA Tournament Bracket
        </h2>
        <div className="mt-4 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 max-w-[1800px] mx-auto">

        {/* LEFT SIDE - R16 → QF → SF (flowing right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* R16 - Far Left */}
          <div>
            <RoundColumn
              round="R16"
              matches={leftR16}
              orientation="left"
              showConnectors={false}
            />
          </div>

          {/* QF - Middle */}
          <div>
            <RoundColumn
              round="QF"
              matches={leftQF}
              orientation="left"
              showConnectors={false}
            />
          </div>

          {/* SF - Near Center */}
          <div>
            <RoundColumn
              round="SF"
              matches={leftSF}
              orientation="left"
              showConnectors={false}
            />
          </div>
        </div>

        {/* CENTER - Final & 3rd Place */}
        <div className="flex flex-col justify-center gap-12 min-w-[250px]">
          {/* Final */}
          <div>
            <RoundColumn
              round="Final"
              matches={finalMatch}
              orientation="center"
              showConnectors={false}
            />
          </div>

          {/* Divider */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-muted to-transparent" />

          {/* 3rd Place */}
          <div>
            <RoundColumn
              round="3rdPlace"
              matches={thirdPlaceMatch}
              orientation="center"
              showConnectors={false}
            />
          </div>
        </div>

        {/* RIGHT SIDE - R16 → QF → SF (flowing left) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* SF - Near Center */}
          <div>
            <RoundColumn
              round="SF"
              matches={rightSF}
              orientation="right"
              showConnectors={false}
            />
          </div>

          {/* QF - Middle */}
          <div>
            <RoundColumn
              round="QF"
              matches={rightQF}
              orientation="right"
              showConnectors={false}
            />
          </div>

          {/* R16 - Far Right */}
          <div>
            <RoundColumn
              round="R16"
              matches={rightR16}
              orientation="right"
              showConnectors={false}
            />
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Total Matches: {matches.length} | Completed:{" "}
          {matches.filter((m) => m.status === "completed").length} | Live:{" "}
          {matches.filter((m) => m.status === "live").length}
        </p>
      </div>
    </div>
  );
}
