"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SetupPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches/r16");
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerChange = (matchId: string, field: "player1" | "player2", value: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.player1 || !match.player2) {
      alert("Please enter both player names");
      return;
    }

    try {
      const response = await fetch("/api/matches/set-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          player1: match.player1,
          player2: match.player2,
        }),
      });

      if (response.ok) {
        alert(`Players set for ${matchId}!`);
      } else {
        alert("Error setting players");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error setting players");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tournament Setup</h1>
            <p className="text-muted-foreground">Add players to Round of 16 matches</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/fifa">Manage Matches</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/fifa">View Public</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-sm font-mono">{match.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Player 1 name"
                  value={match.player1 || ""}
                  onChange={(e) => handlePlayerChange(match.id, "player1", e.target.value)}
                />
                <Input
                  placeholder="Player 2 name"
                  value={match.player2 || ""}
                  onChange={(e) => handlePlayerChange(match.id, "player2", e.target.value)}
                />
                <Button
                  onClick={() => handleSave(match.id)}
                  className="w-full"
                  disabled={!match.player1 || !match.player2}
                >
                  Save Players
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
