import { connectDB } from "@/lib/mongodb";
import Group, { IGroup } from "@/models/Group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 30; // Revalidate every 30 seconds

async function getGroups() {
  try {
    await connectDB();
    const groups = await Group.find({}).sort({ name: 1 }).lean();
    return groups as unknown as IGroup[];
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export default async function GroupsPage() {
  const groups = await getGroups();

  if (groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-destructive">No Groups Found</h1>
          <p className="text-muted-foreground mb-6">
            Please run the group seeding script first.
          </p>
          <code className="bg-muted px-4 py-2 rounded">npm run seed-groups</code>
        </div>
      </div>
    );
  }

  // Split groups into 2 rows of 4
  const row1Groups = groups.slice(0, 4); // Groups A, B, C, D
  const row2Groups = groups.slice(4, 8); // Groups E, F, G, H

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Group Stage Standings
            </h1>
            <p className="text-xl text-muted-foreground">FIFA Tournament - Kite Games Studio</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/groups">Admin Panel</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Knockout Bracket</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/table-tennis/groups">🏓 TT Groups</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dart">🎯 Dart</Link>
            </Button>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Groups Grid - 2 Rows × 4 Columns */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Row 1: Groups A, B, C, D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row1Groups.map((group) => (
            <GroupStandingsCard key={group.name} group={group} />
          ))}
        </div>

        {/* Row 2: Groups E, F, G, H */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row2Groups.map((group) => (
            <GroupStandingsCard key={group.name} group={group} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-12 p-6 bg-card rounded-lg border">
        <h3 className="font-bold mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary">Top 2</Badge>
            <span className="text-muted-foreground">Qualify for Round of 16</span>
          </div>
          <div className="text-muted-foreground">
            <strong>Points:</strong> Win = 3, Draw = 1, Loss = 0
          </div>
          <div className="text-muted-foreground">
            <strong>W/L:</strong> Wins / Losses
          </div>
          <div className="text-muted-foreground">
            <strong>GD:</strong> Goal Difference (Goals For - Goals Against)
          </div>
          <div className="text-muted-foreground">
            <strong>Sorting:</strong> Points → GD → Goals For
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupStandingsCard({ group }: { group: IGroup }) {
  // Calculate standings using the model method
  const standings = [...group.players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
  });

  // Check if top 2 have same points (tie)
  const hasTie = standings.length >= 2 &&
                 standings[0].points === standings[1].points &&
                 standings[0].points > 0;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
          Group {group.name}
          {hasTie && (
            <Badge variant="destructive" className="text-[10px]">TIE</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center w-12">W</TableHead>
              <TableHead className="text-center w-12">L</TableHead>
              <TableHead className="text-center w-12">GD</TableHead>
              <TableHead className="text-center w-16">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((player, index) => (
              <TableRow
                key={player.name}
                className={index < 2 ? "bg-primary/10 font-bold" : ""}
              >
                <TableCell className="text-center font-mono">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium truncate">
                  {player.name}
                  {index < 2 && (
                    <Badge variant="default" className="ml-2 text-[10px] bg-primary">
                      Q
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {player.wins}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {player.losses}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {player.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Additional Stats */}
        <div className="p-3 border-t bg-muted/30">
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <div className="font-bold text-muted-foreground">MP</div>
              <div>{standings[0]?.matchesPlayed || 0}</div>
            </div>
            <div>
              <div className="font-bold text-muted-foreground">GF</div>
              <div>{standings.reduce((sum, p) => sum + p.goalsFor, 0)}</div>
            </div>
            <div>
              <div className="font-bold text-muted-foreground">GA</div>
              <div>{standings.reduce((sum, p) => sum + p.goalsAgainst, 0)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
