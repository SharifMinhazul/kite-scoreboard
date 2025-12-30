import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Table2, LogOut } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  const games = [
    {
      title: "FIFA Tournament",
      icon: Trophy,
      description: "Manage knockout bracket and group stage",
      color: "from-green-500 to-emerald-600",
      knockoutHref: "/admin/fifa",
      groupsHref: "/admin/fifa/groups",
      publicHref: "/fifa",
    },
    {
      title: "Dart Tournament",
      icon: Target,
      description: "Manage rounds and player scores",
      color: "from-red-500 to-orange-600",
      knockoutHref: "/admin/dart",
      publicHref: "/dart",
    },
    {
      title: "Table Tennis",
      icon: Table2,
      description: "Manage knockout bracket and group stage",
      color: "from-blue-500 to-cyan-600",
      knockoutHref: "/admin/table-tennis",
      groupsHref: "/admin/table-tennis/groups",
      publicHref: "/table-tennis",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/">View Public</Link>
        </Button>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="destructive" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </form>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Kite Games Studio Tournament Management
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            Welcome, <strong>{session?.user?.name}</strong>
          </div>
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
                    <Link href={game.knockoutHref}>Manage Knockout</Link>
                  </Button>
                  {game.groupsHref && (
                    <Button asChild variant="secondary" className="w-full">
                      <Link href={game.groupsHref}>Manage Groups</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link href={game.publicHref}>View Public →</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tournament Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start" size="sm">
                  <Link href="/admin/fifa/setup">FIFA - Add Players</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="sm">
                  <Link href="/admin/table-tennis/setup">Table Tennis - Add Players</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Group Stage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start" size="sm">
                  <Link href="/admin/fifa/groups/setup">FIFA - Distribute Groups</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="sm">
                  <Link href="/admin/table-tennis/groups/setup">TT - Distribute Groups</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
