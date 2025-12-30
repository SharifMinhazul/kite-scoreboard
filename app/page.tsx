import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const games = [
    {
      title: "FIFA WORLD CUP",
      subtitle: "KNOCKOUT BRACKET",
      description: "16-TEAM ELIMINATION • GROUP STAGE QUALIFYING",
      href: "/fifa",
      groupsHref: "/fifa/groups",
      accentColor: "hsl(var(--primary))",
      num: "01",
    },
    {
      title: "DART CHALLENGE",
      subtitle: "SURVIVAL MODE",
      description: "ROUND ELIMINATION • TOP 50% ADVANCE",
      href: "/dart",
      accentColor: "hsl(var(--secondary))",
      num: "02",
    },
    {
      title: "TABLE TENNIS",
      subtitle: "CHAMPIONSHIP",
      description: "16-TEAM BRACKET • 8 GROUP QUALIFIERS",
      href: "/table-tennis",
      groupsHref: "/table-tennis/groups",
      accentColor: "hsl(var(--accent))",
      num: "03",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-primary to-transparent z-50"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-secondary to-transparent z-50"></div>

      {/* Admin access button */}
      <div className="fixed top-6 right-6 z-50">
        <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display">
          <Link href="/login">ADMIN ACCESS</Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Broadcast header */}
        <div className="text-center mb-20 broadcast-title">
          <div className="inline-block mb-6">
            <div className="text-sm font-display tracking-[0.3em] text-primary mb-2">LIVE TOURNAMENT BROADCAST</div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              KITE GAMES
            </span>
            <span className="block text-foreground mt-2">
              STUDIO
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-primary"></div>
            <div className="electric-pulse w-3 h-3 bg-accent rounded-full"></div>
            <p className="text-xs font-display tracking-widest text-muted-foreground">
              REAL-TIME SCOREBOARDS
            </p>
            <div className="electric-pulse w-3 h-3 bg-accent rounded-full"></div>
            <div className="h-px w-16 bg-primary"></div>
          </div>
        </div>

        {/* Tournament grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {games.map((game, index) => (
            <div
              key={game.title}
              className={`broadcast-wipe stagger-${index + 1} group`}
            >
              <div className="relative border-2 border-border hover:border-primary transition-all duration-300 bg-card/50 backdrop-blur-sm stripe-pattern">
                {/* Tournament number */}
                <div className="absolute -top-4 -left-4 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: game.accentColor }}>
                  <span className="text-4xl font-bold" style={{ color: 'hsl(var(--background))' }}>{game.num}</span>
                </div>

                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: game.accentColor }}></div>

                <div className="p-8 pt-12">
                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-4xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {game.title}
                    </h2>
                    <div className="text-sm font-display tracking-wider" style={{ color: game.accentColor }}>
                      {game.subtitle}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-mono text-muted-foreground mb-8 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button asChild className="w-full font-display tracking-wider" size="lg">
                      <Link href={game.href}>
                        VIEW BRACKET →
                      </Link>
                    </Button>
                    {game.groupsHref && (
                      <Button asChild variant="outline" className="w-full font-display tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        <Link href={game.groupsHref}>
                          GROUP STAGE →
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute bottom-0 right-0 w-16 h-16 border-t-2 border-l-2 border-border group-hover:border-primary transition-colors"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent"></div>
              <span>LIVE UPDATES</span>
            </div>
            <div className="h-px w-16 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary"></div>
              <span>AUTO-ADVANCE</span>
            </div>
            <div className="h-px w-16 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary"></div>
              <span>GROUP STAGES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
