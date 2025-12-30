import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";

export async function POST(request: NextRequest) {
  try {
    const { matchId, player1, player2 } = await request.json();

    if (!matchId || !player1 || !player2) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const match = await Match.findOne({ id: matchId });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    match.player1 = player1;
    match.player2 = player2;
    match.status = "scheduled";

    await match.save();

    return NextResponse.json({
      success: true,
      message: "Players set successfully",
      match: match.toObject(),
    });
  } catch (error) {
    console.error("Error setting players:", error);
    return NextResponse.json(
      { error: "Failed to set players" },
      { status: 500 }
    );
  }
}
