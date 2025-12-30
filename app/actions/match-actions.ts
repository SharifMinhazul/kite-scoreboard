"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Match, { IMatch } from "@/models/Match";

// Validation schema for score updates
const UpdateScoreSchema = z.object({
  matchId: z.string().min(1),
  score1: z.number().int().min(0),
  score2: z.number().int().min(0),
});

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Update match scores and automatically advance the winner to the next match
 */
export async function updateScore(
  matchId: string,
  score1: number,
  score2: number
): Promise<ActionResult<IMatch>> {
  try {
    // Validate inputs
    const validation = UpdateScoreSchema.safeParse({ matchId, score1, score2 });
    if (!validation.success) {
      return {
        success: false,
        message: `Invalid input: ${validation.error.message}`,
      };
    }

    // Prevent ties (can add penalty shootout logic later)
    if (score1 === score2) {
      return {
        success: false,
        message: "Scores cannot be tied. Please enter different scores.",
      };
    }

    await connectDB();

    // Find the current match
    const currentMatch = await Match.findOne({ id: matchId });
    if (!currentMatch) {
      return {
        success: false,
        message: `Match ${matchId} not found`,
      };
    }

    // Validate that the match can be updated
    if (!currentMatch.canUpdateScore()) {
      return {
        success: false,
        message: `Match ${matchId} cannot be updated. Check that both players are set and match is not already completed.`,
      };
    }

    // Update the current match
    currentMatch.score1 = score1;
    currentMatch.score2 = score2;
    currentMatch.status = "completed";
    currentMatch.completedTime = new Date();

    await currentMatch.save();

    // Determine winner and loser
    const winner = currentMatch.determineWinner();
    const loser = winner === currentMatch.player1 ? currentMatch.player2 : currentMatch.player1;

    // Advance winner to next match (if exists)
    if (currentMatch.nextMatchId && currentMatch.winnerDestinationSlot && winner) {
      const nextMatch = await Match.findOne({ id: currentMatch.nextMatchId });

      if (nextMatch) {
        // Update the appropriate slot in the next match
        if (currentMatch.winnerDestinationSlot === "player1") {
          nextMatch.player1 = winner;
        } else {
          nextMatch.player2 = winner;
        }

        // If both players are now set, mark as scheduled
        if (nextMatch.player1 && nextMatch.player2) {
          nextMatch.status = "scheduled";
        }

        await nextMatch.save();
      }
    }

    // Advance loser to next match (for SF → 3rd Place)
    if (currentMatch.loserNextMatchId && currentMatch.loserDestinationSlot && loser) {
      const loserNextMatch = await Match.findOne({ id: currentMatch.loserNextMatchId });

      if (loserNextMatch) {
        // Update the appropriate slot in the loser next match
        if (currentMatch.loserDestinationSlot === "player1") {
          loserNextMatch.player1 = loser;
        } else {
          loserNextMatch.player2 = loser;
        }

        // If both players are now set, mark as scheduled
        if (loserNextMatch.player1 && loserNextMatch.player2) {
          loserNextMatch.status = "scheduled";
        }

        await loserNextMatch.save();
      }
    }

    // Revalidate paths to refresh the UI
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Match ${matchId} updated successfully. ${winner} advances to ${currentMatch.nextMatchId || "victory"}!`,
      data: currentMatch.toObject(),
    };
  } catch (error) {
    console.error("Error updating score:", error);
    return {
      success: false,
      message: `Failed to update score: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get all matches from the database
 */
export async function getAllMatches(): Promise<ActionResult<IMatch[]>> {
  try {
    await connectDB();

    const matches = await Match.find({}).sort({ round: 1, side: 1, position: 1 }).lean();

    return {
      success: true,
      message: "Matches retrieved successfully",
      data: matches as unknown as IMatch[],
    };
  } catch (error) {
    console.error("Error fetching matches:", error);
    return {
      success: false,
      message: `Failed to fetch matches: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get matches filtered by round
 */
export async function getMatchesByRound(round: string): Promise<ActionResult<IMatch[]>> {
  try {
    await connectDB();

    const matches = await Match.find({ round }).sort({ side: 1, position: 1 }).lean();

    return {
      success: true,
      message: `Matches for round ${round} retrieved successfully`,
      data: matches as unknown as IMatch[],
    };
  } catch (error) {
    console.error("Error fetching matches by round:", error);
    return {
      success: false,
      message: `Failed to fetch matches: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Reset a match (clear scores and winner advancement)
 */
export async function resetMatch(matchId: string): Promise<ActionResult<IMatch>> {
  try {
    await connectDB();

    const match = await Match.findOne({ id: matchId });

    if (!match) {
      return {
        success: false,
        message: `Match ${matchId} not found`,
      };
    }

    // Reset scores and status
    match.score1 = null;
    match.score2 = null;
    match.status = "scheduled";
    match.completedTime = null;

    await match.save();

    // Also clear this match's winner from any next matches
    if (match.nextMatchId) {
      const nextMatch = await Match.findOne({ id: match.nextMatchId });
      if (nextMatch && match.winnerDestinationSlot) {
        if (match.winnerDestinationSlot === "player1") {
          nextMatch.player1 = null;
        } else {
          nextMatch.player2 = null;
        }
        nextMatch.status = "scheduled";
        await nextMatch.save();
      }
    }

    // Clear from loser next match (for SF)
    if (match.loserNextMatchId) {
      const loserNextMatch = await Match.findOne({ id: match.loserNextMatchId });
      if (loserNextMatch && match.loserDestinationSlot) {
        if (match.loserDestinationSlot === "player1") {
          loserNextMatch.player1 = null;
        } else {
          loserNextMatch.player2 = null;
        }
        loserNextMatch.status = "scheduled";
        await loserNextMatch.save();
      }
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Match ${matchId} has been reset`,
      data: match.toObject(),
    };
  } catch (error) {
    console.error("Error resetting match:", error);
    return {
      success: false,
      message: `Failed to reset match: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Update match status manually (for live/scheduled toggling)
 */
export async function updateMatchStatus(
  matchId: string,
  status: "scheduled" | "live" | "completed"
): Promise<ActionResult<IMatch>> {
  try {
    await connectDB();

    const match = await Match.findOne({ id: matchId });

    if (!match) {
      return {
        success: false,
        message: `Match ${matchId} not found`,
      };
    }

    match.status = status;
    await match.save();

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Match ${matchId} status updated to ${status}`,
      data: match.toObject(),
    };
  } catch (error) {
    console.error("Error updating match status:", error);
    return {
      success: false,
      message: `Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Add initial players to R16 matches (helper function for setup)
 */
export async function setInitialPlayers(
  matchId: string,
  player1: string,
  player2: string
): Promise<ActionResult<IMatch>> {
  try {
    await connectDB();

    const match = await Match.findOne({ id: matchId });

    if (!match) {
      return {
        success: false,
        message: `Match ${matchId} not found`,
      };
    }

    match.player1 = player1;
    match.player2 = player2;
    match.status = "scheduled";

    await match.save();

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Players set for match ${matchId}`,
      data: match.toObject(),
    };
  } catch (error) {
    console.error("Error setting players:", error);
    return {
      success: false,
      message: `Failed to set players: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
