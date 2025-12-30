import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TableTennisGroup from "@/models/TableTennisGroup";
import TableTennis from "@/models/TableTennis";

export async function POST() {
  try {
    await connectDB();

    // Get all groups sorted by name
    const groups = await TableTennisGroup.find({}).sort({ name: 1 });

    if (groups.length !== 8) {
      return NextResponse.json(
        { error: "Need exactly 8 groups" },
        { status: 400 }
      );
    }

    // Get top 2 from each group
    const qualifiedPlayers: string[] = [];

    for (const group of groups) {
      // Check if group has at least 2 players
      if (group.players.length < 2) {
        return NextResponse.json(
          { error: `Group ${group.name} has less than 2 players. Each group needs at least 2 players.` },
          { status: 400 }
        );
      }

      const standings = [...group.players].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      });

      const top2 = standings.slice(0, 2);

      // Double-check we have both players
      if (!top2[0] || !top2[1]) {
        return NextResponse.json(
          { error: `Group ${group.name} doesn't have 2 valid players` },
          { status: 400 }
        );
      }

      qualifiedPlayers.push(top2[0].name, top2[1].name);
    }

    if (qualifiedPlayers.length !== 16) {
      return NextResponse.json(
        { error: "Should have exactly 16 qualified players" },
        { status: 400 }
      );
    }

    // Standard World Cup R16 Pairing Format:
    // qualifiedPlayers array order: [1A, 2A, 1B, 2B, 1C, 2C, 1D, 2D, 1E, 2E, 1F, 2F, 1G, 2G, 1H, 2H]
    // Indices:                        [0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15]

    const matchups = [
      // LEFT BRACKET
      { matchId: "TT-L-R16-1", p1: qualifiedPlayers[0], p2: qualifiedPlayers[3] },   // 1A vs 2B
      { matchId: "TT-L-R16-2", p1: qualifiedPlayers[4], p2: qualifiedPlayers[7] },   // 1C vs 2D
      { matchId: "TT-L-R16-3", p1: qualifiedPlayers[2], p2: qualifiedPlayers[1] },   // 1B vs 2A
      { matchId: "TT-L-R16-4", p1: qualifiedPlayers[6], p2: qualifiedPlayers[5] },   // 1D vs 2C

      // RIGHT BRACKET
      { matchId: "TT-R-R16-1", p1: qualifiedPlayers[8], p2: qualifiedPlayers[11] },  // 1E vs 2F
      { matchId: "TT-R-R16-2", p1: qualifiedPlayers[12], p2: qualifiedPlayers[15] }, // 1G vs 2H
      { matchId: "TT-R-R16-3", p1: qualifiedPlayers[10], p2: qualifiedPlayers[9] },  // 1F vs 2E
      { matchId: "TT-R-R16-4", p1: qualifiedPlayers[14], p2: qualifiedPlayers[13] }, // 1H vs 2G
    ];

    // Update R16 matches
    for (const matchup of matchups) {
      await TableTennis.findOneAndUpdate(
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
