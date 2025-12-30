import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TableTennisGroup from "@/models/TableTennisGroup";

export async function POST(request: Request) {
  try {
    const { groupName, player1, player2, score1, score2 } = await request.json();

    if (!groupName || !player1 || !player2 || score1 === undefined || score2 === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const group = await TableTennisGroup.findOne({ name: groupName });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const p1 = group.players.find((p) => p.name === player1);
    const p2 = group.players.find((p) => p.name === player2);

    if (!p1 || !p2) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Update stats
    p1.matchesPlayed++;
    p2.matchesPlayed++;

    p1.goalsFor += score1;
    p1.goalsAgainst += score2;
    p2.goalsFor += score2;
    p2.goalsAgainst += score1;

    p1.goalDifference = p1.goalsFor - p1.goalsAgainst;
    p2.goalDifference = p2.goalsFor - p2.goalsAgainst;

    if (score1 > score2) {
      p1.wins++;
      p2.losses++;
      p1.points += 3;
    } else if (score2 > score1) {
      p2.wins++;
      p1.losses++;
      p2.points += 3;
    } else {
      p1.draws++;
      p2.draws++;
      p1.points++;
      p2.points++;
    }

    await group.save();

    return NextResponse.json({
      message: `Match result recorded: ${player1} ${score1}-${score2} ${player2}`,
    });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
