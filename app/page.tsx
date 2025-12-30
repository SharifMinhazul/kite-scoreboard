import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Table2 } from "lucide-react";

export default function HomePage() {
  const games = [
    {
      title: "FIFA Tournament",
      icon: Trophy,
      description: "World Cup-style knockout bracket with group stage",
      color: "from-green-500 to-emerald-600",
      href: "/fifa",
      groupsHref: "/fifa/groups",
    },
    {
      title: "Dart Tournament",
      icon: Target,
      description: "Round-based elimination with top 50% qualification",
      color: "from-red-500 to-orange-600",
      href: "/dart",
    },
    {
      title: "Table Tennis",
      icon: Table2,
      description: "Knockout bracket with group stage qualifying",
      color: "from-blue-500 to-cyan-600",
      href: "/table-tennis",
      groupsHref: "/table-tennis/groups",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Admin Login</Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Kite Games Studio
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Tournament Scoreboards
          </p>
          <div className="mt-6 h-[2px] w-64 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.title}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{game.title}</CardTitle>
                  <CardDescription className="text-base">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href={game.href}>View Bracket</Link>
                  </Button>
                  {game.groupsHref && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={game.groupsHref}>View Groups</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Live tournament brackets with real-time updates
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Next.js, MongoDB & Shadcn UI
          </p>
        </div>
      </div>
    </div>
  );
}
