"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateTTScore } from "@/app/actions/table-tennis-actions";
import { ITableTennis } from "@/models/TableTennis";
import { Loader2 } from "lucide-react";

interface TTScoreInputProps {
  match: ITableTennis;
}

export function TTScoreInput({ match }: TTScoreInputProps) {
  const [score1, setScore1] = useState(match.score1?.toString() || "");
  const [score2, setScore2] = useState(match.score2?.toString() || "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!match.player1 || !match.player2) {
      setMessage("❌ Both players must be set");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!score1 || !score2) {
      setMessage("❌ Please enter scores for both players");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    if (isNaN(s1) || isNaN(s2)) {
      setMessage("❌ Invalid scores");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    startTransition(async () => {
      const result = await updateTTScore(match.id, s1, s2);

      if (result.success) {
        setMessage("✅ Score saved! Winner advanced.");
      } else {
        setMessage(`❌ ${result.message}`);
      }

      setTimeout(() => setMessage(""), 3000);
    });
  };

  const winner =
    match.score1 !== null && match.score2 !== null
      ? match.score1 > match.score2
        ? match.player1
        : match.player2
      : null;

  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";

  return (
    <Card
      className={`${
        isCompleted
          ? "border-primary/50"
          : isLive
          ? "border-destructive animate-pulse"
          : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{match.id}</CardTitle>
          {isCompleted && (
            <Badge variant="outline" className="text-xs">
              Completed
            </Badge>
          )}
          {isLive && (
            <Badge variant="destructive" className="text-xs">
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Player 1 */}
          <div
            className={`flex items-center gap-2 p-2 rounded ${
              winner === match.player1 ? "bg-primary/20 border border-primary" : "bg-muted/50"
            }`}
          >
            <div className="flex-1 font-medium text-sm truncate">
              {match.player1 || "TBD"}
            </div>
            <Input
              type="number"
              min="0"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              disabled={isCompleted || !match.player1 || !match.player2 || isPending}
              className="w-20 h-9"
              placeholder="-"
            />
          </div>

          {/* Player 2 */}
          <div
            className={`flex items-center gap-2 p-2 rounded ${
              winner === match.player2 ? "bg-primary/20 border border-primary" : "bg-muted/50"
            }`}
          >
            <div className="flex-1 font-medium text-sm truncate">
              {match.player2 || "TBD"}
            </div>
            <Input
              type="number"
              min="0"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              disabled={isCompleted || !match.player1 || !match.player2 || isPending}
              className="w-20 h-9"
              placeholder="-"
            />
          </div>

          {/* Submit Button */}
          {!isCompleted && match.player1 && match.player2 && (
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              size="sm"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Save & Advance"}
            </Button>
          )}

          {/* Message */}
          {message && (
            <div
              className={`text-xs text-center p-2 rounded ${
                message.includes("✅")
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message}
            </div>
          )}

          {/* Winner Display */}
          {isCompleted && winner && (
            <div className="text-center">
              <Badge variant="default" className="bg-primary">
                Winner: {winner}
              </Badge>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
