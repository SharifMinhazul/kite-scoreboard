import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Group from "@/models/Group";

export async function POST(request: NextRequest) {
  try {
    const { groupName, player1Name, player2Name } = await request.json();

    if (!groupName || !player1Name || !player2Name) {
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

    // Find both players
    const player1Index = group.players.findIndex((p) => p.name === player1Name);
    const player2Index = group.players.findIndex((p) => p.name === player2Name);

    if (player1Index === -1 || player2Index === -1) {
      return NextResponse.json(
        { error: "One or both players not found in group" },
        { status: 404 }
      );
    }

    // Swap the players in the array
    const temp = group.players[player1Index];
    group.players[player1Index] = group.players[player2Index];
    group.players[player2Index] = temp;

    await group.save();

    return NextResponse.json({
      success: true,
      message: `Swapped ${player1Name} and ${player2Name} in Group ${groupName}`,
      group: group.toObject(),
    });
  } catch (error) {
    console.error("Error swapping players:", error);
    return NextResponse.json(
      { error: "Failed to swap players" },
      { status: 500 }
    );
  }
}
