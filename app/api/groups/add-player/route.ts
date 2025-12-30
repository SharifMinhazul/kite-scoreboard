import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Group from "@/models/Group";

export async function POST(request: NextRequest) {
  try {
    const { groupName, playerName } = await request.json();

    if (!groupName || !playerName) {
      return NextResponse.json(
        { error: "Missing groupName or playerName" },
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

    // Check if player already exists in this group
    const exists = group.players.some((p) => p.name === playerName);
    if (exists) {
      return NextResponse.json(
        { error: "Player already exists in this group" },
        { status: 400 }
      );
    }

    // Add new player with initial stats
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
      success: true,
      message: `${playerName} added to Group ${groupName}`,
      group: group.toObject(),
    });
  } catch (error) {
    console.error("Error adding player:", error);
    return NextResponse.json(
      { error: "Failed to add player" },
      { status: 500 }
    );
  }
}
