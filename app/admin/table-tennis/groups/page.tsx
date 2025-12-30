"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

export default function AdminTTGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/tt-groups");
      const data = await response.json();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].name);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const currentGroup = groups.find((g) => g.name === selectedGroup);
  const availablePlayers = currentGroup?.players || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!player1 || !player2 || !score1 || !score2) {
      setMessage("❌ Please fill all fields");
      return;
    }

    if (player1 === player2) {
      setMessage("❌ Players must be different");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/tt-groups/update-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup,
          player1,
          player2,
          score1: parseInt(score1),
          score2: parseInt(score2),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setScore1("");
        setScore2("");
        fetchGroups(); // Refresh data
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Error updating match");
    } finally {
      setLoading(false);
    }
  };

  const advanceToKnockout = async () => {
    if (!confirm("Are you sure you want to advance all top 2 players from each group to Round of 16?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tt-groups/advance-to-knockout", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}\n\nGo to /admin/table-tennis to see the updated bracket!`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert("❌ Error advancing to knockout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏓 Table Tennis Group Stage Admin</h1>
            <p className="text-muted-foreground">Enter group match results</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/admin/table-tennis/groups/setup">Setup Players</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/table-tennis/groups/standings">Manage Ties</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/table-tennis">Knockout Admin</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/table-tennis/groups">View Public</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Match Result</CardTitle>
              <CardDescription>Record a group stage match</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Group Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Group</label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.name} value={group.name}>
                          Group {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Player 1 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Player 1</label>
                  <Select value={player1} onValueChange={setPlayer1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((player) => (
                        <SelectItem key={player.name} value={player.name}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Score 1 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Player 1 Score</label>
                  <Input
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Player 2 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Player 2</label>
                  <Select value={player2} onValueChange={setPlayer2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((player) => (
                        <SelectItem key={player.name} value={player.name}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Score 2 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Player 2 Score</label>
                  <Input
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-3 rounded text-sm ${
                    message.includes("✅") ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Match Result"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Group Standings */}
          <Card>
            <CardHeader>
              <CardTitle>Group {selectedGroup} Standings</CardTitle>
              <CardDescription>Current points table</CardDescription>
            </CardHeader>
            <CardContent>
              {currentGroup && (
                <div className="space-y-2">
                  {[...currentGroup.players]
                    .sort((a, b) => {
                      if (b.points !== a.points) return b.points - a.points;
                      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
                      return 0;
                    })
                    .map((player, index) => (
                      <div
                        key={player.name}
                        className={`p-3 rounded ${
                          index < 2 ? "bg-primary/10 border border-primary" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono w-6">{index + 1}.</span>
                            <span className="font-medium">{player.name}</span>
                            {index < 2 && (
                              <Badge variant="default" className="bg-primary text-[10px]">
                                Q
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="font-bold">
                            {player.points} pts
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground ml-8">
                          <span>W: {player.wins}</span>
                          <span>L: {player.losses}</span>
                          <span>GD: {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advance to Knockout Button */}
        <Card className="mt-8 border-primary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Advance to Knockout Stage</h3>
                <p className="text-sm text-muted-foreground">
                  This will take the top 2 players from each group and populate the Round of 16
                </p>
              </div>
              <Button onClick={advanceToKnockout} disabled={loading} size="lg">
                Advance to R16
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
