import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TableTennisGroup from "@/models/TableTennisGroup";

export async function POST(request: Request) {
  try {
    const { groupName, playerName } = await request.json();

    if (!groupName || !playerName) {
      return NextResponse.json(
        { error: "Group name and player name are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const group = await TableTennisGroup.findOne({ name: groupName });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if player already exists
    if (group.players.some((p) => p.name === playerName)) {
      return NextResponse.json(
        { error: "Player already exists in this group" },
        { status: 400 }
      );
    }

    group.players.push({
      name: playerName,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });

    await group.save();

    return NextResponse.json({
      message: `Player ${playerName} added to Group ${groupName}`,
    });
  } catch (error) {
    console.error("Error adding player:", error);
    return NextResponse.json(
      { error: "Failed to add player" },
      { status: 500 }
    );
  }
}
