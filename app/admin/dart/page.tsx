"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import {
  getDartTournament,
  addDartPlayer,
  updateDartScore,
  endDartRound,
  resetDartTournament,
  removeDartPlayer,
} from "@/app/actions/dart-actions";
import { IDart } from "@/models/Dart";

export default function AdminDartPage() {
  const [tournament, setTournament] = useState<IDart | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<{ name: string; score: number } | null>(null);
  const [tempScore, setTempScore] = useState(0);

  useEffect(() => {
    fetchTournament();
  }, []);

  const fetchTournament = async () => {
    const result = await getDartTournament();
    if (result.success && result.data) {
      setTournament(result.data);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      setMessage("❌ Player name cannot be empty");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await addDartPlayer(newPlayerName);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      setNewPlayerName("");
      await fetchTournament();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRemovePlayer = async (playerName: string) => {
    if (!confirm(`Remove ${playerName} from the tournament?`)) return;

    setLoading(true);
    const result = await removeDartPlayer(playerName);

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      await fetchTournament();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdateScore = async () => {
    if (!editingPlayer || !tournament) return;

    setLoading(true);
    setMessage("");

    const result = await updateDartScore(
      tournament.currentRound,
      editingPlayer.name,
      tempScore
    );

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      setEditingPlayer(null);
      await fetchTournament();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEndRound = async () => {
    if (!tournament) return;

    const currentRound = tournament.rounds.find((r) => r.roundNumber === tournament.currentRound);
    if (!currentRound) return;

    const confirmMsg =
      currentRound.players.length <= 3
        ? "This will end the tournament. Are you sure?"
        : `End Round ${tournament.currentRound} and advance qualified players to Round ${tournament.currentRound + 1}?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setMessage("");

    const result = await endDartRound();

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      await fetchTournament();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleResetTournament = async () => {
    if (
      !confirm(
        "⚠️ This will DELETE all rounds and scores and start a fresh tournament. Are you absolutely sure?"
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await resetDartTournament();

    if (result.success) {
      setMessage(`✅ ${result.message}`);
      await fetchTournament();
    } else {
      setMessage(`❌ ${result.message}`);
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading tournament...</div>
      </div>
    );
  }

  const currentRound = tournament.rounds.find((r) => r.roundNumber === tournament.currentRound);
  const sortedPlayers = currentRound
    ? [...currentRound.players].sort((a, b) => b.score - a.score)
    : [];
  const qualifyCount = currentRound ? Math.ceil(currentRound.players.length / 2) : 0;
  const qualifyThreshold = sortedPlayers[qualifyCount - 1]?.score || 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎯 Dart Tournament Admin</h1>
            <p className="text-muted-foreground">Manage players and scores</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="default">
              <Link href="/dart">View Public Board</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Knockout Admin</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/groups">Group Admin</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/table-tennis">🏓 TT Admin</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="outline" className="px-4 py-2">
            {tournament.isFinished ? "🏁 Finished" : `Round ${tournament.currentRound}`}
          </Badge>
          {currentRound && (
            <>
              <Badge variant="default" className="px-4 py-2">
                {currentRound.players.length} Players
              </Badge>
              {!tournament.isFinished && currentRound.players.length > 3 && (
                <Badge variant="secondary" className="px-4 py-2">
                  Top {qualifyCount} Qualify
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`max-w-7xl mx-auto mb-6 p-4 rounded-lg border ${
            message.includes("✅")
              ? "bg-primary/10 text-primary border-primary"
              : "bg-destructive/10 text-destructive border-destructive"
          }`}
        >
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Add Players (Round 1 only) */}
        {tournament.currentRound === 1 && currentRound && !currentRound.isCompleted && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Add Players to Round 1</CardTitle>
              <CardDescription>Add all players before starting the tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPlayer();
                  }}
                  disabled={loading}
                />
                <Button onClick={handleAddPlayer} disabled={loading}>
                  Add Player
                </Button>
              </div>

              {currentRound.players.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Current Players:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentRound.players.map((player) => (
                      <Badge key={player.name} variant="outline" className="px-3 py-1">
                        {player.name}
                        <button
                          onClick={() => handleRemovePlayer(player.name)}
                          className="ml-2 text-destructive hover:text-destructive/80"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Round Scoreboard */}
        {currentRound && currentRound.players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Round {tournament.currentRound} Scoreboard
                {currentRound.isCompleted && <Badge variant="outline">Completed</Badge>}
                {currentRound.isActive && !currentRound.isCompleted && (
                  <Badge variant="default" className="animate-pulse">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {tournament.isFinished
                  ? "Tournament finished! These are the final standings."
                  : currentRound.players.length <= 3
                  ? "3 or fewer players - final round!"
                  : `Top ${qualifyCount} players will qualify for Round ${tournament.currentRound + 1}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center w-32">Score</TableHead>
                    <TableHead className="text-center w-32">Status</TableHead>
                    {!currentRound.isCompleted && (
                      <TableHead className="text-center w-24">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player, index) => {
                    const wouldQualify = player.score >= qualifyThreshold;

                    return (
                      <TableRow
                        key={player.name}
                        className={
                          wouldQualify && !currentRound.isCompleted
                            ? "bg-primary/10 border-l-4 border-primary"
                            : ""
                        }
                      >
                        <TableCell className="text-center font-mono text-lg">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-lg">{player.name}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-2xl font-bold text-primary">{player.score}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {wouldQualify && !currentRound.isCompleted ? (
                            <Badge variant="default" className="bg-primary">
                              ✓ Qualifying
                            </Badge>
                          ) : !wouldQualify && !currentRound.isCompleted ? (
                            <Badge variant="secondary">Playing</Badge>
                          ) : null}
                        </TableCell>
                        {!currentRound.isCompleted && (
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPlayer(player);
                                setTempScore(player.score);
                              }}
                              disabled={loading}
                            >
                              ✏️ Edit
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {!currentRound.isCompleted && currentRound.players.length > 1 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleEndRound} disabled={loading} size="lg">
                    {currentRound.players.length <= 3
                      ? "🏁 Finish Tournament"
                      : `✅ End Round ${tournament.currentRound} → Advance to Round ${tournament.currentRound + 1}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reset Tournament */}
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Reset the entire tournament (deletes all rounds and scores)
                </p>
              </div>
              <Button onClick={handleResetTournament} disabled={loading} variant="destructive">
                🔄 Reset Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Score Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Score</CardTitle>
              <CardDescription>Update score for {editingPlayer.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Score</label>
                <Input
                  type="number"
                  min="0"
                  value={tempScore}
                  onChange={(e) => setTempScore(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateScore();
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingPlayer(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateScore} disabled={loading}>
                  Save Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
