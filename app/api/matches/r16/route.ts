import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET() {
  try {
    await connectDB();
    const matches = await Match.find({ round: "R16" })
      .sort({ side: 1, position: 1 })
      .lean();

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching R16 matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
