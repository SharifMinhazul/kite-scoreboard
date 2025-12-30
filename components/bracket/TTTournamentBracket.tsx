import { ITableTennis } from "@/models/TableTennis";
import { IMatch } from "@/models/Match";
import { RoundColumn } from "./RoundColumn";

interface TTTournamentBracketProps {
  matches: ITableTennis[];
}

export function TTTournamentBracket({ matches }: TTTournamentBracketProps) {
  // Filter matches by side
  const leftMatches = matches.filter((m) => m.side === "left");
  const rightMatches = matches.filter((m) => m.side === "right");
  const centerMatches = matches.filter((m) => m.side === "center");

  // Group left side by round (cast to IMatch for component compatibility)
  const leftR16 = leftMatches.filter((m) => m.round === "R16") as unknown as IMatch[];
  const leftQF = leftMatches.filter((m) => m.round === "QF") as unknown as IMatch[];
  const leftSF = leftMatches.filter((m) => m.round === "SF") as unknown as IMatch[];

  // Group right side by round (cast to IMatch for component compatibility)
  const rightR16 = rightMatches.filter((m) => m.round === "R16") as unknown as IMatch[];
  const rightQF = rightMatches.filter((m) => m.round === "QF") as unknown as IMatch[];
  const rightSF = rightMatches.filter((m) => m.round === "SF") as unknown as IMatch[];

  // Center matches (cast to IMatch for component compatibility)
  const finalMatch = centerMatches.filter((m) => m.round === "Final") as unknown as IMatch[];

  return (
    <div className="w-full min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-accent to-transparent z-50"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-primary to-transparent z-50"></div>

      {/* Header */}
      <div className="text-center mb-12 broadcast-title">
        <div className="inline-block mb-4">
          <div className="text-xs font-display tracking-[0.3em] text-accent mb-2">KNOCKOUT STAGE • ELIMINATION BRACKET</div>
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-none">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
            TABLE TENNIS
          </span>
          <span className="block text-foreground mt-1 text-xl md:text-4xl">
            TOURNAMENT BRACKET
          </span>
        </h1>

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="h-px w-12 bg-accent"></div>
          <div className="electric-pulse w-3 h-3 bg-accent rounded-full"></div>
          <p className="text-[10px] font-display tracking-widest text-muted-foreground">
            KITE GAMES STUDIO
          </p>
          <div className="electric-pulse w-3 h-3 bg-accent rounded-full"></div>
          <div className="h-px w-12 bg-accent"></div>
        </div>

        <div className="mt-6 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
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

        {/* CENTER - Final */}
        <div className="flex flex-col justify-center min-w-[250px]">
          <RoundColumn
            round="Final"
            matches={finalMatch}
            orientation="center"
            showConnectors={false}
          />
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
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-8 text-xs font-mono text-muted-foreground p-4 bg-card/30 backdrop-blur-sm border border-accent/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent"></div>
            <span className="font-display tracking-wider">TOTAL: {matches.length}</span>
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary"></div>
            <span className="font-display tracking-wider">DONE: {matches.filter((m) => m.status === "completed").length}</span>
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary electric-pulse"></div>
            <span className="font-display tracking-wider">LIVE: {matches.filter((m) => m.status === "live").length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
