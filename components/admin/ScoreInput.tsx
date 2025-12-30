"use client";

import { useState, useTransition } from "react";
import { IMatch } from "@/models/Match";
import { updateScore, resetMatch } from "@/app/actions/match-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ScoreInputProps {
  match: IMatch;
}

export function ScoreInput({ match }: ScoreInputProps) {
  const [score1, setScore1] = useState(match.score1?.toString() || "");
  const [score2, setScore2] = useState(match.score2?.toString() || "");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      setMessage("Please enter valid scores (non-negative numbers)");
      setIsError(true);
      return;
    }

    if (s1 === s2) {
      setMessage("Scores cannot be tied. Please enter different scores.");
      setIsError(true);
      return;
    }

    startTransition(async () => {
      const result = await updateScore(match.id, s1, s2);

      setMessage(result.message);
      setIsError(!result.success);

      // Clear form on success
      if (result.success) {
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetMatch(match.id);

      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        setScore1("");
        setScore2("");

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    });
  };

  const canUpdate = match.player1 && match.player2;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-mono">{match.id}</CardTitle>
            <CardDescription>{match.round} - {match.side}</CardDescription>
          </div>
          <Badge
            variant={
              match.status === "completed"
                ? "default"
                : match.status === "live"
                ? "destructive"
                : "outline"
            }
          >
            {match.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player 1 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 font-medium truncate">
              {match.player1 || <span className="italic text-muted-foreground">TBD</span>}
            </div>
            <Input
              type="number"
              min="0"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              placeholder="Score"
              className="w-20"
              disabled={!canUpdate || isPending || match.status === "completed"}
            />
          </div>

          {/* Player 2 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 font-medium truncate">
              {match.player2 || <span className="italic text-muted-foreground">TBD</span>}
            </div>
            <Input
              type="number"
              min="0"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              placeholder="Score"
              className="w-20"
              disabled={!canUpdate || isPending || match.status === "completed"}
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm p-2 rounded ${
                isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!canUpdate || isPending || match.status === "completed"}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Advance"
          )}
        </Button>

        {match.status === "completed" && (
          <Button
            onClick={handleReset}
            disabled={isPending}
            variant="outline"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
