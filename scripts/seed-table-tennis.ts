import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import TableTennis, { TTRound, TTSide, TTSlot } from "../models/TableTennis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-scorecard";

interface MatchDefinition {
  id: string;
  round: TTRound;
  side: TTSide;
  position: number;
  nextMatchId: string | null;
  winnerDestinationSlot: TTSlot | null;
}

function buildMatchDefinitions(): MatchDefinition[] {
  const matches: MatchDefinition[] = [];

  // LEFT SIDE
  // Round of 16 (4 matches on left)
  for (let i = 0; i < 4; i++) {
    const qfMatch = Math.floor(i / 2) + 1; // 0-1 -> QF-1, 2-3 -> QF-2
    const slot: TTSlot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `TT-L-R16-${i + 1}`,
      round: "R16",
      side: "left",
      position: i,
      nextMatchId: `TT-L-QF-${qfMatch}`,
      winnerDestinationSlot: slot,
    });
  }

  // Quarter Finals (2 matches on left)
  for (let i = 0; i < 2; i++) {
    const slot: TTSlot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `TT-L-QF-${i + 1}`,
      round: "QF",
      side: "left",
      position: i,
      nextMatchId: "TT-L-SF-1",
      winnerDestinationSlot: slot,
    });
  }

  // Semi Final (1 match on left)
  matches.push({
    id: "TT-L-SF-1",
    round: "SF",
    side: "left",
    position: 0,
    nextMatchId: "TT-C-F-1",
    winnerDestinationSlot: "player1",
  });

  // RIGHT SIDE
  // Round of 16 (4 matches on right)
  for (let i = 0; i < 4; i++) {
    const qfMatch = Math.floor(i / 2) + 1; // 0-1 -> QF-1, 2-3 -> QF-2
    const slot: TTSlot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `TT-R-R16-${i + 1}`,
      round: "R16",
      side: "right",
      position: i,
      nextMatchId: `TT-R-QF-${qfMatch}`,
      winnerDestinationSlot: slot,
    });
  }

  // Quarter Finals (2 matches on right)
  for (let i = 0; i < 2; i++) {
    const slot: TTSlot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `TT-R-QF-${i + 1}`,
      round: "QF",
      side: "right",
      position: i,
      nextMatchId: "TT-R-SF-1",
      winnerDestinationSlot: slot,
    });
  }

  // Semi Final (1 match on right)
  matches.push({
    id: "TT-R-SF-1",
    round: "SF",
    side: "right",
    position: 0,
    nextMatchId: "TT-C-F-1",
    winnerDestinationSlot: "player2",
  });

  // CENTER - FINAL
  matches.push({
    id: "TT-C-F-1",
    round: "Final",
    side: "center",
    position: 0,
    nextMatchId: null,
    winnerDestinationSlot: null,
  });

  return matches;
}

async function createMatches(definitions: MatchDefinition[]) {
  console.log(`Creating ${definitions.length} matches...`);

  const matches = definitions.map((def) => ({
    id: def.id,
    round: def.round,
    side: def.side,
    position: def.position,
    player1: null,
    player2: null,
    score1: null,
    score2: null,
    status: "scheduled",
    nextMatchId: def.nextMatchId,
    winnerDestinationSlot: def.winnerDestinationSlot,
    scheduledTime: null,
    completedTime: null,
  }));

  await TableTennis.insertMany(matches);
  console.log(`✅ Created ${matches.length} matches successfully`);
}

function validateBracket(definitions: MatchDefinition[]) {
  console.log("\nValidating bracket structure...");

  const matchIds = new Set(definitions.map((m) => m.id));
  let isValid = true;

  for (const match of definitions) {
    // Check that nextMatchId exists (if not null)
    if (match.nextMatchId && !matchIds.has(match.nextMatchId)) {
      console.error(`❌ Invalid nextMatchId: ${match.id} -> ${match.nextMatchId}`);
      isValid = false;
    }

    // Check that winnerDestinationSlot is set when nextMatchId exists
    if (match.nextMatchId && !match.winnerDestinationSlot) {
      console.error(`❌ Missing winnerDestinationSlot: ${match.id}`);
      isValid = false;
    }
  }

  if (isValid) {
    console.log("✅ Bracket structure is valid!");
  } else {
    console.error("❌ Bracket structure has errors!");
  }

  return isValid;
}

async function clearBracket() {
  console.log("Clearing existing bracket...");
  const result = await TableTennis.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} existing matches`);
}

async function printSummary() {
  console.log("\n=== BRACKET SUMMARY ===");

  const rounds: TTRound[] = ["R16", "QF", "SF", "Final"];

  for (const round of rounds) {
    const count = await TableTennis.countDocuments({ round });
    console.log(`${round}: ${count} matches`);
  }

  const total = await TableTennis.countDocuments();
  console.log(`\nTotal: ${total} matches`);

  console.log("\n=== SAMPLE MATCHES ===");
  const samples = await TableTennis.find().limit(5);
  samples.forEach((match) => {
    console.log(
      `${match.id} (${match.round}, ${match.side}) -> Next: ${match.nextMatchId || "None"} (${match.winnerDestinationSlot || "N/A"})`
    );
  });
}

async function main() {
  try {
    console.log("🏓 Starting Table Tennis bracket seeding...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Build match definitions
    const definitions = buildMatchDefinitions();
    console.log(`Built ${definitions.length} match definitions\n`);

    // Validate bracket structure
    const isValid = validateBracket(definitions);
    if (!isValid) {
      console.error("\n❌ Validation failed! Aborting...");
      process.exit(1);
    }

    // Clear existing bracket
    await clearBracket();

    // Create matches
    await createMatches(definitions);

    // Print summary
    await printSummary();

    console.log("\n✅ Table Tennis bracket seeding completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Navigate to: /admin/table-tennis/setup");
    console.log("   3. Add players to R16 matches");
    console.log("   4. Enter scores and watch auto-advance!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding:");
    console.error(error);
    process.exit(1);
  }
}

main();
