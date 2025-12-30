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

export default async function GroupsPage({
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
          <code className="bg-muted px-4 py-2 rounded">npm run seed-groups</code>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isSlideshow ? 'p-4 flex flex-col' : 'p-4 md:p-8'}`}>
      {/* Corner accent bars */}
      <div className="fixed top-0 left-0 w-2 h-32 bg-gradient-to-b from-primary to-transparent z-50"></div>
      <div className="fixed top-0 right-0 w-32 h-2 bg-gradient-to-l from-accent to-transparent z-50"></div>

      {/* Navigation */}
      {!isSlideshow && (
        <div className="fixed top-6 right-6 z-50 flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display">
            <Link href="/">HOME</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display">
            <Link href="/fifa">BRACKET</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 font-display">
            <Link href="/admin/fifa/groups">ADMIN</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className={`max-w-7xl mx-auto broadcast-title ${isSlideshow ? 'mb-4' : 'mb-8'}`}>
        <div className={`text-center ${isSlideshow ? 'mb-3' : 'mb-6'}`}>
          <div className={`inline-block ${isSlideshow ? 'mb-2' : 'mb-4'}`}>
            <div className={`font-display tracking-[0.3em] text-primary ${isSlideshow ? 'text-[8px] mb-1' : 'text-xs mb-2'}`}>GROUP STAGE • ROUND ROBIN</div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>

          <h1 className={`font-bold leading-none ${isSlideshow ? 'text-3xl md:text-4xl mb-2' : 'text-5xl md:text-7xl lg:text-8xl mb-3'}`}>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              FIFA WORLD CUP
            </span>
            <span className={`block text-foreground ${isSlideshow ? 'mt-0.5' : 'mt-1'}`}>
              GROUP STANDINGS
            </span>
          </h1>

          {!isSlideshow && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="h-px w-12 bg-primary"></div>
              <div className="electric-pulse w-3 h-3 bg-primary rounded-full"></div>
              <p className="text-[10px] font-display tracking-widest text-muted-foreground">
                KITE GAMES STUDIO
              </p>
              <div className="electric-pulse w-3 h-3 bg-primary rounded-full"></div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
          )}
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Groups Grid */}
      {isSlideshow ? (
        // Slideshow mode: 4x2 grid to show all 8 groups without scrolling
        <div className="flex-1 flex flex-col justify-center w-full px-6 space-y-8">
          {/* Row 1: Groups A, B, C, D */}
          <div className="grid grid-cols-4 gap-6">
            {groups.slice(0, 4).map((group) => (
              <div key={group.name} className="broadcast-wipe">
                <GroupStandingsCard group={group} isSlideshow={isSlideshow} />
              </div>
            ))}
          </div>

          {/* Row 2: Groups E, F, G, H */}
          <div className="grid grid-cols-4 gap-6">
            {groups.slice(4, 8).map((group) => (
              <div key={group.name} className="broadcast-wipe">
                <GroupStandingsCard group={group} isSlideshow={isSlideshow} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Normal mode: 3-3-2 grid
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Row 1: Groups A, B, C */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.slice(0, 3).map((group, index) => (
              <div key={group.name} className={`broadcast-wipe stagger-${index + 1}`}>
                <GroupStandingsCard group={group} isSlideshow={isSlideshow} />
              </div>
            ))}
          </div>

          {/* Row 2: Groups D, E, F */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.slice(3, 6).map((group, index) => (
              <div key={group.name} className={`broadcast-wipe stagger-${index + 1}`}>
                <GroupStandingsCard group={group} isSlideshow={isSlideshow} />
              </div>
            ))}
          </div>

          {/* Row 3: Groups G, H */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.slice(6, 8).map((group, index) => (
              <div key={group.name} className={`broadcast-wipe stagger-${index + 1}`}>
                <GroupStandingsCard group={group} isSlideshow={isSlideshow} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {!isSlideshow && (
        <div className="max-w-7xl mx-auto mt-12 p-8 bg-card/50 backdrop-blur-sm stripe-pattern border-2 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>

        <h3 className="font-bold text-xl mb-6 font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          TOURNAMENT INFO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20">
            <Badge variant="default" className="bg-primary font-display text-[10px] tracking-wider">Q</Badge>
            <span className="text-muted-foreground">TOP 2 ADVANCE TO R16</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-primary font-bold">POINTS:</span> <span className="text-muted-foreground">W=3 • D=1 • L=0</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-primary font-bold">W/L:</span> <span className="text-muted-foreground">WINS / LOSSES</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border">
            <span className="text-primary font-bold">GD:</span> <span className="text-muted-foreground">GOAL DIFFERENCE</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border col-span-1 md:col-span-2">
            <span className="text-primary font-bold">TIEBREAKER:</span> <span className="text-muted-foreground">POINTS → GD → GF</span>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function GroupStandingsCard({ group, isSlideshow = false }: { group: IGroup; isSlideshow?: boolean }) {
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
    <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm stripe-pattern relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
      {/* Corner decoration */}
      {!isSlideshow && <div className="absolute bottom-0 right-0 w-12 h-12 border-t-2 border-l-2 border-primary/20"></div>}

      <CardHeader className={isSlideshow ? "pb-3 pt-4 px-4" : "pb-3"}>
        <CardTitle className={`text-center font-bold flex items-center justify-center gap-2 ${isSlideshow ? 'text-2xl' : 'text-2xl'}`}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            GROUP {group.name}
          </span>
          {hasTie && (
            <Badge variant="destructive" className="text-[8px] font-display electric-pulse">TIE</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={`text-center ${isSlideshow ? 'w-10 text-sm py-3' : 'w-12'}`}>#</TableHead>
              <TableHead className={isSlideshow ? 'text-sm py-3' : ''}>Player</TableHead>
              <TableHead className={`text-center ${isSlideshow ? 'w-10 text-sm py-3' : 'w-12'}`}>W</TableHead>
              <TableHead className={`text-center ${isSlideshow ? 'w-10 text-sm py-3' : 'w-12'}`}>L</TableHead>
              <TableHead className={`text-center ${isSlideshow ? 'w-10 text-sm py-3' : 'w-12'}`}>GD</TableHead>
              <TableHead className={`text-center ${isSlideshow ? 'w-12 text-sm py-3' : 'w-16'}`}>Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((player, index) => (
              <TableRow
                key={player.name}
                className={index < 2 ? "bg-primary/10 font-bold" : ""}
              >
                <TableCell className={`text-center font-mono ${isSlideshow ? 'text-sm py-3 px-3' : ''}`}>
                  {index + 1}
                </TableCell>
                <TableCell className={`font-medium truncate ${isSlideshow ? 'text-sm py-3 px-3' : ''}`}>
                  {player.name}
                  {index < 2 && (
                    <Badge variant="default" className={`ml-1 bg-primary ${isSlideshow ? 'text-[10px] px-1.5' : 'text-[10px]'}`}>
                      Q
                    </Badge>
                  )}
                </TableCell>
                <TableCell className={`text-center ${isSlideshow ? 'text-sm py-3 px-3' : 'text-sm'}`}>
                  {player.wins}
                </TableCell>
                <TableCell className={`text-center ${isSlideshow ? 'text-sm py-3 px-3' : 'text-sm'}`}>
                  {player.losses}
                </TableCell>
                <TableCell className={`text-center ${isSlideshow ? 'text-sm py-3 px-3' : 'text-sm'}`}>
                  {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                </TableCell>
                <TableCell className={`text-center font-bold ${isSlideshow ? 'text-sm py-3 px-3' : ''}`}>
                  {player.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Additional Stats - hide in slideshow mode */}
        {!isSlideshow && (
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
        )}
      </CardContent>
    </Card>
  );
}
