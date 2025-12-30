import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Group, { GroupName } from "@/models/Group";

export async function POST() {
  try {
    await connectDB();

    // Clear existing groups
    await Group.deleteMany({});

    // Create all 8 groups (A-H) with no players
    const groupNames: GroupName[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (const name of groupNames) {
      const group = new Group({
        name,
        players: [],
      });
      await group.save();
    }

    return NextResponse.json({
      success: true,
      message: "All 8 groups initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing groups:", error);
    return NextResponse.json(
      { error: "Failed to initialize groups" },
      { status: 500 }
    );
  }
}
