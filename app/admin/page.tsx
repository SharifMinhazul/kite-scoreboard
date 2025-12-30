import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Table2, LogOut } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  const games = [
    {
      title: "FIFA WORLD CUP",
      subtitle: "KNOCKOUT BRACKET",
      icon: Trophy,
      description: "16-TEAM ELIMINATION • GROUP STAGE QUALIFYING",
      accentColor: "hsl(var(--primary))",
      num: "01",
      knockoutHref: "/admin/fifa",
      groupsHref: "/admin/fifa/groups",
      publicHref: "/fifa",
    },
    {
      title: "DART CHALLENGE",
      subtitle: "SURVIVAL MODE",
      icon: Target,
      description: "ROUND ELIMINATION • TOP 50% ADVANCE",
      accentColor: "hsl(var(--secondary))",
      num: "02",
      knockoutHref: "/admin/dart",
      publicHref: "/dart",
    },
    {
      title: "TABLE TENNIS",
      subtitle: "CHAMPIONSHIP",
      icon: Table2,
      description: "16-TEAM BRACKET • 8 GROUP QUALIFIERS",
      accentColor: "hsl(var(--accent))",
      num: "03",
      knockoutHref: "/admin/table-tennis",
      groupsHref: "/admin/table-tennis/groups",
      publicHref: "/table-tennis",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-primary to-transparent z-40"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-secondary to-transparent z-40"></div>

      {/* Navigation */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display">
          <Link href="/">PUBLIC VIEW</Link>
        </Button>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="destructive" size="sm" className="font-display">
            <LogOut className="w-4 h-4 mr-2" />
            LOGOUT
          </Button>
        </form>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 broadcast-title">
          <div className="inline-block mb-4">
            <div className="text-xs font-display tracking-[0.3em] text-secondary mb-2">AUTHORIZED ACCESS • TOURNAMENT CONTROL</div>
            <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              ADMIN
            </span>
            <span className="block text-foreground mt-2">
              DASHBOARD
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-12 bg-secondary"></div>
            <div className="electric-pulse w-3 h-3 bg-secondary rounded-full"></div>
            <p className="text-xs font-display tracking-wider text-muted-foreground">
              USER: {session?.user?.name?.toUpperCase()}
            </p>
            <div className="electric-pulse w-3 h-3 bg-secondary rounded-full"></div>
            <div className="h-px w-12 bg-secondary"></div>
          </div>

          <div className="mt-6 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent" />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game, index) => {
            const Icon = game.icon;
            return (
              <div
                key={game.title}
                className={`broadcast-wipe stagger-${index + 1} group`}
              >
                <Card className="border-2 border-border hover:border-primary transition-all duration-300 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
                  {/* Tournament number */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 flex items-center justify-center z-10" style={{ backgroundColor: game.accentColor }}>
                    <span className="text-4xl font-bold" style={{ color: 'hsl(var(--background))' }}>{game.num}</span>
                  </div>

                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: game.accentColor }}></div>

                  <CardHeader className="pt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-muted/50" style={{ backgroundColor: `${game.accentColor}15` }}>
                        <Icon className="w-6 h-6" style={{ color: game.accentColor }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {game.title}
                        </CardTitle>
                        <div className="text-xs font-display tracking-wider" style={{ color: game.accentColor }}>
                          {game.subtitle}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs font-mono text-muted-foreground leading-relaxed">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full font-display tracking-wider" size="lg">
                      <Link href={game.knockoutHref}>MANAGE KNOCKOUT →</Link>
                    </Button>
                    {game.groupsHref && (
                      <Button asChild variant="outline" className="w-full font-display tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        <Link href={game.groupsHref}>MANAGE GROUPS →</Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full font-display tracking-wider" size="sm">
                      <Link href={game.publicHref}>VIEW PUBLIC →</Link>
                    </Button>
                  </CardContent>

                  {/* Corner decoration */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-t-2 border-l-2 border-border group-hover:border-primary transition-colors"></div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">QUICK ACCESS</h2>
            <div className="mt-2 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 broadcast-wipe stagger-4">
            <Card className="border-2 border-accent/30 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>
              <CardHeader>
                <CardTitle className="text-xl font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                  TOURNAMENT SETUP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start font-display text-xs tracking-wider border-primary/30 hover:border-primary" size="sm">
                  <Link href="/admin/fifa/setup">FIFA • ADD PLAYERS →</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start font-display text-xs tracking-wider border-accent/30 hover:border-accent" size="sm">
                  <Link href="/admin/table-tennis/setup">TABLE TENNIS • ADD PLAYERS →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <CardHeader>
                <CardTitle className="text-xl font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  GROUP STAGE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start font-display text-xs tracking-wider border-primary/30 hover:border-primary" size="sm">
                  <Link href="/admin/fifa/groups/setup">FIFA • DISTRIBUTE GROUPS →</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start font-display text-xs tracking-wider border-accent/30 hover:border-accent" size="sm">
                  <Link href="/admin/table-tennis/groups/setup">TT • DISTRIBUTE GROUPS →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
