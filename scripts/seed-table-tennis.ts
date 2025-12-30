import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import TableTennis from "../models/TableTennis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-scorecard";

interface MatchDefinition {
  id: string;
  round: "R16" | "QF" | "SF" | "Final";
  position: number;
  nextMatchId: string | null;
  winnerDestinationSlot: "player1" | "player2" | null;
}

function buildMatchDefinitions(): MatchDefinition[] {
  const matches: MatchDefinition[] = [];

  // Round of 16 (8 matches)
  // R16-1 and R16-2 → QF-1
  matches.push({
    id: "TT-R16-1",
    round: "R16",
    position: 0,
    nextMatchId: "TT-QF-1",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-R16-2",
    round: "R16",
    position: 1,
    nextMatchId: "TT-QF-1",
    winnerDestinationSlot: "player2",
  });

  // R16-3 and R16-4 → QF-2
  matches.push({
    id: "TT-R16-3",
    round: "R16",
    position: 2,
    nextMatchId: "TT-QF-2",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-R16-4",
    round: "R16",
    position: 3,
    nextMatchId: "TT-QF-2",
    winnerDestinationSlot: "player2",
  });

  // R16-5 and R16-6 → QF-3
  matches.push({
    id: "TT-R16-5",
    round: "R16",
    position: 4,
    nextMatchId: "TT-QF-3",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-R16-6",
    round: "R16",
    position: 5,
    nextMatchId: "TT-QF-3",
    winnerDestinationSlot: "player2",
  });

  // R16-7 and R16-8 → QF-4
  matches.push({
    id: "TT-R16-7",
    round: "R16",
    position: 6,
    nextMatchId: "TT-QF-4",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-R16-8",
    round: "R16",
    position: 7,
    nextMatchId: "TT-QF-4",
    winnerDestinationSlot: "player2",
  });

  // Quarter Finals (4 matches)
  // QF-1 and QF-2 → SF-1
  matches.push({
    id: "TT-QF-1",
    round: "QF",
    position: 0,
    nextMatchId: "TT-SF-1",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-QF-2",
    round: "QF",
    position: 1,
    nextMatchId: "TT-SF-1",
    winnerDestinationSlot: "player2",
  });

  // QF-3 and QF-4 → SF-2
  matches.push({
    id: "TT-QF-3",
    round: "QF",
    position: 2,
    nextMatchId: "TT-SF-2",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-QF-4",
    round: "QF",
    position: 3,
    nextMatchId: "TT-SF-2",
    winnerDestinationSlot: "player2",
  });

  // Semi Finals (2 matches)
  // SF-1 and SF-2 → Final
  matches.push({
    id: "TT-SF-1",
    round: "SF",
    position: 0,
    nextMatchId: "TT-F-1",
    winnerDestinationSlot: "player1",
  });
  matches.push({
    id: "TT-SF-2",
    round: "SF",
    position: 1,
    nextMatchId: "TT-F-1",
    winnerDestinationSlot: "player2",
  });

  // Final (1 match)
  matches.push({
    id: "TT-F-1",
    round: "Final",
    position: 0,
    nextMatchId: null,
    winnerDestinationSlot: null,
  });

  return matches;
}

async function seedTableTennis() {
  try {
    console.log("🏓 Starting Table Tennis bracket seeding...");
    console.log("📝 MongoDB URI:", MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Clear existing table tennis matches
    await TableTennis.deleteMany({});
    console.log("🗑️  Cleared existing table tennis matches");

    // Build match definitions
    const matchDefinitions = buildMatchDefinitions();
    console.log(`📊 Generated ${matchDefinitions.length} match definitions`);

    // Create matches
    const createdMatches = await TableTennis.insertMany(
      matchDefinitions.map((def) => ({
        id: def.id,
        round: def.round,
        position: def.position,
        player1: null,
        player2: null,
        score1: null,
        score2: null,
        status: "scheduled",
        nextMatchId: def.nextMatchId,
        winnerDestinationSlot: def.winnerDestinationSlot,
        completedTime: null,
      }))
    );

    console.log(`✅ Created ${createdMatches.length} table tennis matches`);

    // Breakdown by round
    const r16Count = createdMatches.filter((m) => m.round === "R16").length;
    const qfCount = createdMatches.filter((m) => m.round === "QF").length;
    const sfCount = createdMatches.filter((m) => m.round === "SF").length;
    const finalCount = createdMatches.filter((m) => m.round === "Final").length;

    console.log("\n📋 Bracket Structure:");
    console.log(`   Round of 16: ${r16Count} matches`);
    console.log(`   Quarter Finals: ${qfCount} matches`);
    console.log(`   Semi Finals: ${sfCount} matches`);
    console.log(`   Final: ${finalCount} match`);
    console.log(`   Total: ${createdMatches.length} matches`);

    console.log("\n✅ Table Tennis bracket seeding completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Navigate to: /admin/table-tennis/setup");
    console.log("   3. Add players to R16 matches");
    console.log("   4. Enter scores and watch auto-advance!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding table tennis bracket:", error);
    process.exit(1);
  }
}

seedTableTennis();
