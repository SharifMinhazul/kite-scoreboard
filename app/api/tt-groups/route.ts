import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TableTennisGroup from "@/models/TableTennisGroup";

export async function GET() {
  try {
    await connectDB();
    const groups = await TableTennisGroup.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching TT groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
