"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";

interface Player {
  name: string;
  points: number;
}

interface Group {
  _id: string;
  name: string;
  players: Player[];
}

export default function GroupSetupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const addPlayerToGroup = async (groupName: string) => {
    const playerName = newPlayerName[groupName]?.trim();

    if (!playerName) {
      alert("Please enter a player name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/groups/add-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, playerName }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${playerName} added to Group ${groupName}`);
        setNewPlayerName({ ...newPlayerName, [groupName]: "" });
        fetchGroups();
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert("❌ Error adding player");
    } finally {
      setLoading(false);
    }
  };

  const removePlayerFromGroup = async (groupName: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from Group ${groupName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/groups/remove-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, playerName }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${playerName} removed from Group ${groupName}`);
        fetchGroups();
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert("❌ Error removing player");
    } finally {
      setLoading(false);
    }
  };

  const initializeAllGroups = async () => {
    if (!confirm("Initialize all 8 groups (A-H)? This will clear existing groups.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/groups/initialize", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}`);
        fetchGroups();
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert("❌ Error initializing groups");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Group Setup</h1>
            <p className="text-muted-foreground">Add and manage players in each group</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={initializeAllGroups} variant="outline" disabled={loading}>
              Initialize Groups
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/groups">Enter Matches</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/groups">View Standings</Link>
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-primary/10 text-primary rounded-lg border border-primary">
            {message}
          </div>
        )}

        {/* Groups Grid - 2 Rows × 4 Columns */}
        <div className="space-y-8">
          {/* Row 1: Groups A, B, C, D */}
          <div>
            <h2 className="text-xl font-bold mb-4">Groups A - D</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groups.slice(0, 4).map((group) => (
                <GroupCard
                  key={group.name}
                  group={group}
                  newPlayerName={newPlayerName[group.name] || ""}
                  onNewPlayerNameChange={(value) =>
                    setNewPlayerName({ ...newPlayerName, [group.name]: value })
                  }
                  onAddPlayer={() => addPlayerToGroup(group.name)}
                  onRemovePlayer={(playerName) => removePlayerFromGroup(group.name, playerName)}
                  loading={loading}
                />
              ))}
            </div>
          </div>

          {/* Row 2: Groups E, F, G, H */}
          <div>
            <h2 className="text-xl font-bold mb-4">Groups E - H</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groups.slice(4, 8).map((group) => (
                <GroupCard
                  key={group.name}
                  group={group}
                  newPlayerName={newPlayerName[group.name] || ""}
                  onNewPlayerNameChange={(value) =>
                    setNewPlayerName({ ...newPlayerName, [group.name]: value })
                  }
                  onAddPlayer={() => addPlayerToGroup(group.name)}
                  onRemovePlayer={(playerName) => removePlayerFromGroup(group.name, playerName)}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="mt-8 border-primary">
          <CardContent className="p-6">
            <h3 className="font-bold mb-2">💡 Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Each group should have 3-5 players</li>
              <li>• Click "Initialize Groups" to create all 8 empty groups (A-H)</li>
              <li>• Add players manually to each group</li>
              <li>• Players in each group will play round-robin (everyone vs everyone)</li>
              <li>• Top 2 from each group advance to Round of 16</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  newPlayerName,
  onNewPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  loading,
}: {
  group: Group;
  newPlayerName: string;
  onNewPlayerNameChange: (value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerName: string) => void;
  loading: boolean;
}) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Group {group.name}
        </CardTitle>
        <CardDescription className="text-center">
          <Badge variant="outline">{group.players.length} players</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Players List */}
        <div className="space-y-2">
          {group.players.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground italic">
              No players yet
            </div>
          ) : (
            group.players.map((player, index) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm w-6">{index + 1}.</span>
                  <span className="font-medium text-sm truncate">{player.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePlayer(player.name)}
                  disabled={loading}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add Player Form */}
        <div className="space-y-2 pt-2 border-t">
          <Input
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => onNewPlayerNameChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddPlayer();
              }
            }}
            disabled={loading}
          />
          <Button
            onClick={onAddPlayer}
            disabled={loading || !newPlayerName.trim()}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
