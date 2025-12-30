import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Group from "@/models/Group";

export async function POST(request: NextRequest) {
  try {
    const { groupName, player1, player2, score1, score2 } = await request.json();

    if (!groupName || !player1 || !player2 || score1 === undefined || score2 === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const group = await Group.findOne({ name: groupName });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Find the two players
    const p1 = group.players.find((p) => p.name === player1);
    const p2 = group.players.find((p) => p.name === player2);

    if (!p1 || !p2) {
      return NextResponse.json(
        { error: "Player not found in group" },
        { status: 404 }
      );
    }

    // Update stats for both players
    p1.matchesPlayed += 1;
    p2.matchesPlayed += 1;

    p1.goalsFor += score1;
    p1.goalsAgainst += score2;
    p2.goalsFor += score2;
    p2.goalsAgainst += score1;

    p1.goalDifference = p1.goalsFor - p1.goalsAgainst;
    p2.goalDifference = p2.goalsFor - p2.goalsAgainst;

    // Determine result
    if (score1 > score2) {
      // Player 1 wins
      p1.wins += 1;
      p1.points += 3;
      p2.losses += 1;
    } else if (score2 > score1) {
      // Player 2 wins
      p2.wins += 1;
      p2.points += 3;
      p1.losses += 1;
    } else {
      // Draw
      p1.draws += 1;
      p2.draws += 1;
      p1.points += 1;
      p2.points += 1;
    }

    await group.save();

    return NextResponse.json({
      success: true,
      message: `Match recorded: ${player1} ${score1}-${score2} ${player2}`,
      group: group.toObject(),
    });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
