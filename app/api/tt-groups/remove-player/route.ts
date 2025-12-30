import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TableTennisGroup from "@/models/TableTennisGroup";

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

    const group = await TableTennisGroup.findOne({ name: groupName });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Remove player from array
    group.players = group.players.filter((p) => p.name !== playerName);

    await group.save();

    return NextResponse.json({
      success: true,
      message: `${playerName} removed from Group ${groupName}`,
      group: group.toObject(),
    });
  } catch (error) {
    console.error("Error removing player:", error);
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    );
  }
}
