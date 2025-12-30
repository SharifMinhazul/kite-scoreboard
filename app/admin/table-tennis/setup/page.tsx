"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getTTMatchesByRound, setTTInitialPlayers } from "@/app/actions/table-tennis-actions";
import { ITableTennis } from "@/models/TableTennis";

export default function TableTennisSetupPage() {
  const [matches, setMatches] = useState<ITableTennis[]>([]);
  const [players, setPlayers] = useState<{ [key: string]: { p1: string; p2: string } }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const result = await getTTMatchesByRound("R16");
    if (result.success && result.data) {
      setMatches(result.data);

      // Initialize players state
      const initialPlayers: { [key: string]: { p1: string; p2: string } } = {};
      result.data.forEach((match) => {
        initialPlayers[match.id] = {
          p1: match.player1 || "",
          p2: match.player2 || "",
        };
      });
      setPlayers(initialPlayers);
    }
  };

  const handlePlayerChange = (matchId: string, player: "p1" | "p2", value: string) => {
    setPlayers({
      ...players,
      [matchId]: {
        ...players[matchId],
        [player]: value,
      },
    });
  };

  const handleSaveMatch = async (matchId: string) => {
    const p1 = players[matchId]?.p1?.trim();
    const p2 = players[matchId]?.p2?.trim();

    if (!p1 || !p2) {
      setMessage(`❌ Both players must be entered for ${matchId}`);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    const result = await setTTInitialPlayers(matchId, p1, p2);

    if (result.success) {
      setMessage(`✅ Players set for ${matchId}`);
      await fetchMatches();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const match of matches) {
      const p1 = players[match.id]?.p1?.trim();
      const p2 = players[match.id]?.p2?.trim();

      if (p1 && p2) {
        const result = await setTTInitialPlayers(match.id, p1, p2);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    setMessage(
      `✅ Saved ${successCount} matches${errorCount > 0 ? `, ${errorCount} errors` : ""}`
    );
    await fetchMatches();
    setLoading(false);
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏓 Table Tennis Setup</h1>
            <p className="text-muted-foreground">Add players to Round of 16 matches</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link href="/admin/table-tennis">Admin Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/table-tennis">View Bracket</Link>
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.includes("✅")
                ? "bg-primary/10 text-primary border-primary"
                : "bg-destructive/10 text-destructive border-destructive"
            }`}
          >
            {message}
          </div>
        )}

        {/* Match Setup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-lg">{match.id}</CardTitle>
                <CardDescription>Enter player names</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Player 1</label>
                  <Input
                    value={players[match.id]?.p1 || ""}
                    onChange={(e) => handlePlayerChange(match.id, "p1", e.target.value)}
                    placeholder="Enter player name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Player 2</label>
                  <Input
                    value={players[match.id]?.p2 || ""}
                    onChange={(e) => handlePlayerChange(match.id, "p2", e.target.value)}
                    placeholder="Enter player name"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={() => handleSaveMatch(match.id)}
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  Save Match
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save All Button */}
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Save All Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Save all player names at once (only saves matches with both players entered)
                </p>
              </div>
              <Button onClick={handleSaveAll} disabled={loading} size="lg">
                {loading ? "Saving..." : "💾 Save All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
