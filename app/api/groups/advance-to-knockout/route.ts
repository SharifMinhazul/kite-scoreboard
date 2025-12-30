import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Group from "@/models/Group";
import Match from "@/models/Match";

export async function POST() {
  try {
    await connectDB();

    // Get all groups sorted by name
    const groups = await Group.find({}).sort({ name: 1 });

    if (groups.length !== 8) {
      return NextResponse.json(
        { error: "Need exactly 8 groups" },
        { status: 400 }
      );
    }

    // Get top 2 from each group
    const qualifiedPlayers: string[] = [];

    for (const group of groups) {
      const standings = [...group.players].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      });

      const top2 = standings.slice(0, 2);
      qualifiedPlayers.push(top2[0].name, top2[1].name);
    }

    if (qualifiedPlayers.length !== 16) {
      return NextResponse.json(
        { error: "Should have exactly 16 qualified players" },
        { status: 400 }
      );
    }

    // Mapping: Group winners and runners-up to R16 matches
    // Standard World Cup format:
    // 1A vs 2B, 1C vs 2D, 1E vs 2F, 1G vs 2H (Left bracket)
    // 1B vs 2A, 1D vs 2C, 1F vs 2E, 1H vs 2G (Right bracket)

    const matchups = [
      // Left bracket (positions 0,1,2,3,4,5,6,7 of qualifiedPlayers)
      { matchId: "L-R16-1", p1: qualifiedPlayers[0], p2: qualifiedPlayers[3] },   // 1A vs 2B
      { matchId: "L-R16-2", p1: qualifiedPlayers[4], p2: qualifiedPlayers[7] },   // 1C vs 2D
      { matchId: "L-R16-3", p1: qualifiedPlayers[8], p2: qualifiedPlayers[11] },  // 1E vs 2F
      { matchId: "L-R16-4", p1: qualifiedPlayers[12], p2: qualifiedPlayers[15] }, // 1G vs 2H

      // Right bracket
      { matchId: "R-R16-1", p1: qualifiedPlayers[2], p2: qualifiedPlayers[1] },   // 1B vs 2A
      { matchId: "R-R16-2", p1: qualifiedPlayers[6], p2: qualifiedPlayers[5] },   // 1D vs 2C
      { matchId: "R-R16-3", p1: qualifiedPlayers[10], p2: qualifiedPlayers[9] },  // 1F vs 2E
      { matchId: "R-R16-4", p1: qualifiedPlayers[14], p2: qualifiedPlayers[13] }, // 1H vs 2G

      // Remaining R16 matches (can be filled based on your preference)
      { matchId: "L-R16-5", p1: qualifiedPlayers[1], p2: qualifiedPlayers[2] },
      { matchId: "L-R16-6", p1: qualifiedPlayers[5], p2: qualifiedPlayers[6] },
      { matchId: "L-R16-7", p1: qualifiedPlayers[9], p2: qualifiedPlayers[10] },
      { matchId: "L-R16-8", p1: qualifiedPlayers[13], p2: qualifiedPlayers[14] },

      { matchId: "R-R16-5", p1: qualifiedPlayers[3], p2: qualifiedPlayers[4] },
      { matchId: "R-R16-6", p1: qualifiedPlayers[7], p2: qualifiedPlayers[8] },
      { matchId: "R-R16-7", p1: qualifiedPlayers[11], p2: qualifiedPlayers[12] },
      { matchId: "R-R16-8", p1: qualifiedPlayers[15], p2: qualifiedPlayers[0] },
    ];

    // Update R16 matches
    for (const matchup of matchups) {
      await Match.findOneAndUpdate(
        { id: matchup.matchId },
        {
          player1: matchup.p1,
          player2: matchup.p2,
          status: "scheduled",
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully advanced 16 players to Round of 16!`,
      qualifiedPlayers,
    });
  } catch (error) {
    console.error("Error advancing to knockout:", error);
    return NextResponse.json(
      { error: "Failed to advance to knockout" },
      { status: 500 }
    );
  }
}
