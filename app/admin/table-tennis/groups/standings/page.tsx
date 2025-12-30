"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

interface Player {
  name: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Group {
  _id: string;
  name: string;
  players: Player[];
}

export default function AdminTTGroupStandingsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/tt-groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const swapPlayers = async (groupName: string, player1Name: string, player2Name: string) => {
    if (!confirm(`Swap ${player1Name} (1st) ↔ ${player2Name} (2nd) in Group ${groupName}?`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/tt-groups/swap-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          player1Name,
          player2Name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        fetchGroups();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Error swapping players");
    } finally {
      setLoading(false);
    }
  };

  // Split groups into 2 rows of 4
  const row1Groups = groups.slice(0, 4);
  const row2Groups = groups.slice(4, 8);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏓 Table Tennis Group Standings Management</h1>
            <p className="text-muted-foreground">Swap tied players if needed</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/table-tennis/groups">Enter Matches</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/table-tennis/groups">View Public</Link>
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes("✅")
              ? "bg-primary/10 text-primary border-primary"
              : "bg-destructive/10 text-destructive border-destructive"
          }`}>
            {message}
          </div>
        )}

        {/* Groups Grid - 2 Rows × 4 Columns */}
        <div className="space-y-8">
          {/* Row 1: Groups A, B, C, D */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {row1Groups.map((group) => (
              <GroupStandingsCard
                key={group.name}
                group={group}
                onSwap={swapPlayers}
                loading={loading}
              />
            ))}
          </div>

          {/* Row 2: Groups E, F, G, H */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {row2Groups.map((group) => (
              <GroupStandingsCard
                key={group.name}
                group={group}
                onSwap={swapPlayers}
                loading={loading}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <Card className="mt-8 border-primary">
          <CardContent className="p-6">
            <h3 className="font-bold mb-2">💡 About Swapping</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Groups with "TIE" badge have 1st and 2nd place with equal points</li>
              <li>• Use the swap button to manually decide who should be 1st</li>
              <li>• This affects who advances as winner (1st) vs runner-up (2nd)</li>
              <li>• R16 Pairings: 1A vs 2B, 1B vs 2A, 1C vs 2D, etc.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GroupStandingsCard({
  group,
  onSwap,
  loading,
}: {
  group: Group;
  onSwap: (groupName: string, player1: string, player2: string) => void;
  loading: boolean;
}) {
  // Calculate standings
  const standings = [...group.players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
  });

  // Check if top 2 have same points (tie)
  const hasTie =
    standings.length >= 2 &&
    standings[0].points === standings[1].points &&
    standings[0].points > 0;

  return (
    <Card className={`border-2 ${hasTie ? "border-destructive" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
          Group {group.name}
          {hasTie && (
            <Badge variant="destructive" className="text-[10px]">
              TIE
            </Badge>
          )}
        </CardTitle>
        {hasTie && (
          <CardDescription className="text-center text-destructive text-xs">
            Positions 1 & 2 are tied!
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Standings Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="w-10 text-center">W</TableHead>
              <TableHead className="w-10 text-center">L</TableHead>
              <TableHead className="w-10 text-center">GD</TableHead>
              <TableHead className="w-12 text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((player, index) => (
              <TableRow
                key={player.name}
                className={index < 2 ? "bg-primary/10 font-medium" : ""}
              >
                <TableCell className="text-center font-mono text-sm">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <span className="truncate">{player.name}</span>
                    {index < 2 && (
                      <Badge variant="default" className="text-[8px] bg-primary">
                        Q
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center text-xs">
                  {player.wins}
                </TableCell>
                <TableCell className="text-center text-xs">
                  {player.losses}
                </TableCell>
                <TableCell className="text-center text-xs">
                  {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                </TableCell>
                <TableCell className="text-center font-bold text-sm">
                  {player.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Swap Button (only show if tie exists) */}
        {hasTie && standings.length >= 2 && (
          <Button
            onClick={() => onSwap(group.name, standings[0].name, standings[1].name)}
            disabled={loading}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Swap 1st ↔ 2nd
          </Button>
        )}

        {/* Stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-center text-muted-foreground">
            <div>
              <div className="font-bold">MP</div>
              <div>{standings[0]?.matchesPlayed || 0}</div>
            </div>
            <div>
              <div className="font-bold">GF / GA</div>
              <div>
                {standings[0]?.goalsFor || 0} / {standings[0]?.goalsAgainst || 0}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
