import { connectDB } from "@/lib/mongodb";
import TableTennisGroup, { ITTGroup } from "@/models/TableTennisGroup";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 30; // Revalidate every 30 seconds

async function getGroups() {
  try {
    await connectDB();
    const groups = await TableTennisGroup.find({}).sort({ name: 1 }).lean();
    return groups as unknown as ITTGroup[];
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export default async function TTGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ slideshow?: string }>;
}) {
  const params = await searchParams;
  const isSlideshow = params.slideshow === 'true';
  const groups = await getGroups();

  if (groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-destructive">No Groups Found</h1>
          <p className="text-muted-foreground mb-6">
            Please run the group seeding script first.
          </p>
          <code className="bg-muted px-4 py-2 rounded">npm run seed-tt-groups</code>
        </div>
      </div>
    );
  }

  // Split groups into 2 rows of 4
  const row1Groups = groups.slice(0, 4); // Groups A, B, C, D
  const row2Groups = groups.slice(4, 8); // Groups E, F, G, H

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-accent to-transparent z-50"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-primary to-transparent z-50"></div>

      {/* Navigation */}
      {!isSlideshow && (
        <div className="fixed top-6 right-6 z-50 flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-display">
            <Link href="/">HOME</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-display">
            <Link href="/table-tennis">BRACKET</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="bg-accent hover:bg-accent/90 font-display">
            <Link href="/admin/table-tennis/groups">ADMIN</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 broadcast-title">
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <div className="text-xs font-display tracking-[0.3em] text-accent mb-2">GROUP STAGE • ROUND ROBIN</div>
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
              TABLE TENNIS
            </span>
            <span className="block text-foreground mt-1">
              GROUP STANDINGS
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
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
      </div>

      {/* Groups Grid - 2 Rows × 4 Columns */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Row 1: Groups A, B, C, D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row1Groups.map((group, index) => (
            <div key={group.name} className={`broadcast-wipe stagger-${index + 1}`}>
              <GroupStandingsCard group={group} />
            </div>
          ))}
        </div>

        {/* Row 2: Groups E, F, G, H */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {row2Groups.map((group, index) => (
            <div key={group.name} className={`broadcast-wipe stagger-${index + 1}`}>
              <GroupStandingsCard group={group} />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-12 p-8 bg-card/50 backdrop-blur-sm stripe-pattern border-2 border-accent/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>

        <h3 className="font-bold text-xl mb-6 font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
          TOURNAMENT INFO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
          <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20">
            <Badge variant="default" className="bg-accent font-display text-[10px] tracking-wider">Q</Badge>
            <span className="text-muted-foreground">TOP 2 ADVANCE TO R16</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-accent font-bold">POINTS:</span> <span className="text-muted-foreground">W=3 • D=1 • L=0</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-accent font-bold">W/L:</span> <span className="text-muted-foreground">WINS / LOSSES</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-accent font-bold">GD:</span> <span className="text-muted-foreground">POINT DIFFERENCE</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border col-span-1 md:col-span-2">
            <span className="text-accent font-bold">TIEBREAKER:</span> <span className="text-muted-foreground">POINTS → GD → PF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupStandingsCard({ group }: { group: ITTGroup }) {
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
    <Card className="border-2 border-accent/30 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>
      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-12 h-12 border-t-2 border-l-2 border-accent/20"></div>

      <CardHeader className="pb-3">
        <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            GROUP {group.name}
          </span>
          {hasTie && (
            <Badge variant="destructive" className="text-[10px] font-display electric-pulse">TIE</Badge>
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
              <div className="font-bold text-muted-foreground">PF</div>
              <div>{standings.reduce((sum, p) => sum + p.goalsFor, 0)}</div>
            </div>
            <div>
              <div className="font-bold text-muted-foreground">PA</div>
              <div>{standings.reduce((sum, p) => sum + p.goalsAgainst, 0)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
