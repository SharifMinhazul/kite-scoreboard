"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Dart, { IDart, IDartRound } from "@/models/Dart";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Get the current dart tournament
 */
export async function getDartTournament(): Promise<ActionResult<IDart>> {
  try {
    await connectDB();

    // Get the most recent tournament
    let tournament = await Dart.findOne().sort({ createdAt: -1 }).lean();

    // If no tournament exists, create one with Round 1
    if (!tournament) {
      const newTournament = await Dart.create({
        name: "Dart Tournament",
        rounds: [
          {
            roundNumber: 1,
            players: [],
            isActive: true,
            isCompleted: false,
          },
        ],
        currentRound: 1,
        isFinished: false,
      });
      tournament = newTournament.toObject();
    }

    return {
      success: true,
      message: "Tournament retrieved successfully",
      data: tournament as unknown as IDart,
    };
  } catch (error) {
    console.error("Error fetching dart tournament:", error);
    return {
      success: false,
      message: `Failed to fetch tournament: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Add a player to Round 1
 */
export async function addDartPlayer(playerName: string): Promise<ActionResult<IDart>> {
  try {
    if (!playerName.trim()) {
      return {
        success: false,
        message: "Player name cannot be empty",
      };
    }

    await connectDB();

    const tournament = await Dart.findOne().sort({ createdAt: -1 });

    if (!tournament) {
      return {
        success: false,
        message: "Tournament not found",
      };
    }

    if (!tournament.canAddPlayers()) {
      return {
        success: false,
        message: "Cannot add players - Round 1 is already completed or tournament is finished",
      };
    }

    const round1 = tournament.rounds.find((r) => r.roundNumber === 1);
    if (!round1) {
      return {
        success: false,
        message: "Round 1 not found",
      };
    }

    // Check if player already exists
    if (round1.players.some((p) => p.name === playerName.trim())) {
      return {
        success: false,
        message: "Player already exists in Round 1",
      };
    }

    round1.players.push({
      name: playerName.trim(),
      score: 0,
    });

    await tournament.save();

    revalidatePath("/dart");
    revalidatePath("/admin/dart");

    return {
      success: true,
      message: `Player ${playerName} added successfully`,
      data: tournament.toObject(),
    };
  } catch (error) {
    console.error("Error adding dart player:", error);
    return {
      success: false,
      message: `Failed to add player: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Update a player's score in a specific round
 */
export async function updateDartScore(
  roundNumber: number,
  playerName: string,
  score: number
): Promise<ActionResult<IDart>> {
  try {
    if (score < 0) {
      return {
        success: false,
        message: "Score cannot be negative",
      };
    }

    await connectDB();

    const tournament = await Dart.findOne().sort({ createdAt: -1 });

    if (!tournament) {
      return {
        success: false,
        message: "Tournament not found",
      };
    }

    if (!tournament.canEditScores(roundNumber)) {
      return {
        success: false,
        message: `Cannot edit scores for Round ${roundNumber} - round is not active or is completed`,
      };
    }

    const round = tournament.rounds.find((r) => r.roundNumber === roundNumber);
    if (!round) {
      return {
        success: false,
        message: `Round ${roundNumber} not found`,
      };
    }

    const player = round.players.find((p) => p.name === playerName);
    if (!player) {
      return {
        success: false,
        message: `Player ${playerName} not found in Round ${roundNumber}`,
      };
    }

    player.score = score;
    await tournament.save();

    revalidatePath("/dart");
    revalidatePath("/admin/dart");

    return {
      success: true,
      message: `Score updated for ${playerName}`,
      data: tournament.toObject(),
    };
  } catch (error) {
    console.error("Error updating dart score:", error);
    return {
      success: false,
      message: `Failed to update score: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * End current round and advance qualified players to next round
 */
export async function endDartRound(): Promise<ActionResult<IDart>> {
  try {
    await connectDB();

    const tournament = await Dart.findOne().sort({ createdAt: -1 });

    if (!tournament) {
      return {
        success: false,
        message: "Tournament not found",
      };
    }

    const currentRound = tournament.getCurrentRound();
    if (!currentRound) {
      return {
        success: false,
        message: "Current round not found",
      };
    }

    if (currentRound.isCompleted) {
      return {
        success: false,
        message: "Round is already completed",
      };
    }

    // Sort players by score (descending)
    const sortedPlayers = [...currentRound.players].sort((a, b) => b.score - a.score);

    // Check if we should end the tournament (3 or fewer players)
    if (sortedPlayers.length <= 3) {
      currentRound.isCompleted = true;
      currentRound.isActive = false;
      tournament.isFinished = true;
      await tournament.save();

      revalidatePath("/dart");
      revalidatePath("/admin/dart");

      return {
        success: true,
        message: `Tournament finished! Final standings recorded.`,
        data: tournament.toObject(),
      };
    }

    // Calculate qualification threshold (top 50%)
    const qualifyCount = Math.ceil(sortedPlayers.length / 2);
    const qualifyThresholdScore = sortedPlayers[qualifyCount - 1].score;

    // Include all players with score >= threshold (handles ties)
    const qualifiedPlayers = sortedPlayers.filter((p) => p.score >= qualifyThresholdScore);

    // Mark current round as completed
    currentRound.isCompleted = true;
    currentRound.isActive = false;

    // Create next round
    const nextRoundNumber = tournament.currentRound + 1;
    tournament.rounds.push({
      roundNumber: nextRoundNumber,
      players: qualifiedPlayers.map((p) => ({
        name: p.name,
        score: 0, // Reset scores for next round
      })),
      isActive: true,
      isCompleted: false,
    });

    tournament.currentRound = nextRoundNumber;
    await tournament.save();

    revalidatePath("/dart");
    revalidatePath("/admin/dart");

    return {
      success: true,
      message: `Round ${currentRound.roundNumber} completed! ${qualifiedPlayers.length} players advanced to Round ${nextRoundNumber}`,
      data: tournament.toObject(),
    };
  } catch (error) {
    console.error("Error ending dart round:", error);
    return {
      success: false,
      message: `Failed to end round: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Reset the entire dart tournament
 */
export async function resetDartTournament(): Promise<ActionResult<IDart>> {
  try {
    await connectDB();

    // Delete existing tournament
    await Dart.deleteMany({});

    // Create fresh tournament
    const newTournament = await Dart.create({
      name: "Dart Tournament",
      rounds: [
        {
          roundNumber: 1,
          players: [],
          isActive: true,
          isCompleted: false,
        },
      ],
      currentRound: 1,
      isFinished: false,
    });

    revalidatePath("/dart");
    revalidatePath("/admin/dart");

    return {
      success: true,
      message: "Tournament reset successfully",
      data: newTournament.toObject(),
    };
  } catch (error) {
    console.error("Error resetting dart tournament:", error);
    return {
      success: false,
      message: `Failed to reset tournament: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Remove a player from Round 1 (only if round not completed)
 */
export async function removeDartPlayer(playerName: string): Promise<ActionResult<IDart>> {
  try {
    await connectDB();

    const tournament = await Dart.findOne().sort({ createdAt: -1 });

    if (!tournament) {
      return {
        success: false,
        message: "Tournament not found",
      };
    }

    const round1 = tournament.rounds.find((r) => r.roundNumber === 1);
    if (!round1) {
      return {
        success: false,
        message: "Round 1 not found",
      };
    }

    if (round1.isCompleted) {
      return {
        success: false,
        message: "Cannot remove players - Round 1 is already completed",
      };
    }

    const playerIndex = round1.players.findIndex((p) => p.name === playerName);
    if (playerIndex === -1) {
      return {
        success: false,
        message: `Player ${playerName} not found in Round 1`,
      };
    }

    round1.players.splice(playerIndex, 1);
    await tournament.save();

    revalidatePath("/dart");
    revalidatePath("/admin/dart");

    return {
      success: true,
      message: `Player ${playerName} removed successfully`,
      data: tournament.toObject(),
    };
  } catch (error) {
    console.error("Error removing dart player:", error);
    return {
      success: false,
      message: `Failed to remove player: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
