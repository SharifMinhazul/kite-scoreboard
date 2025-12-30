import { connectDB } from "../lib/mongodb";
import Match, { Round, Side, Slot } from "../models/Match";

interface MatchDefinition {
  id: string;
  round: Round;
  side: Side;
  position: number;
  nextMatchId: string | null;
  winnerDestinationSlot: Slot | null;
  loserNextMatchId: string | null;
  loserDestinationSlot: Slot | null;
}

function buildMatchDefinitions(): MatchDefinition[] {
  const matches: MatchDefinition[] = [];

  // LEFT SIDE
  // Round of 16 (8 matches)
  for (let i = 0; i < 8; i++) {
    const qfMatch = Math.floor(i / 2) + 1; // 0-1 -> QF-1, 2-3 -> QF-2, etc.
    const slot: Slot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `L-R16-${i + 1}`,
      round: "R16",
      side: "left",
      position: i,
      nextMatchId: `L-QF-${qfMatch}`,
      winnerDestinationSlot: slot,
      loserNextMatchId: null,
      loserDestinationSlot: null,
    });
  }

  // Quarter Finals (4 matches)
  for (let i = 0; i < 4; i++) {
    const sfMatch = Math.floor(i / 2) + 1; // 0-1 -> SF-1, 2-3 -> SF-2
    const slot: Slot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `L-QF-${i + 1}`,
      round: "QF",
      side: "left",
      position: i,
      nextMatchId: `L-SF-${sfMatch}`,
      winnerDestinationSlot: slot,
      loserNextMatchId: null,
      loserDestinationSlot: null,
    });
  }

  // Semi Finals (2 matches)
  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `L-SF-${i + 1}`,
      round: "SF",
      side: "left",
      position: i,
      nextMatchId: "C-F-1", // Both winners go to Final
      winnerDestinationSlot: "player1", // Left side winner is player1 in Final
      loserNextMatchId: "C-3P-1", // Losers go to 3rd Place
      loserDestinationSlot: "player1", // Left side loser is player1 in 3rd Place
    });
  }

  // RIGHT SIDE
  // Round of 16 (8 matches)
  for (let i = 0; i < 8; i++) {
    const qfMatch = Math.floor(i / 2) + 1;
    const slot: Slot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `R-R16-${i + 1}`,
      round: "R16",
      side: "right",
      position: i,
      nextMatchId: `R-QF-${qfMatch}`,
      winnerDestinationSlot: slot,
      loserNextMatchId: null,
      loserDestinationSlot: null,
    });
  }

  // Quarter Finals (4 matches)
  for (let i = 0; i < 4; i++) {
    const sfMatch = Math.floor(i / 2) + 1;
    const slot: Slot = i % 2 === 0 ? "player1" : "player2";

    matches.push({
      id: `R-QF-${i + 1}`,
      round: "QF",
      side: "right",
      position: i,
      nextMatchId: `R-SF-${sfMatch}`,
      winnerDestinationSlot: slot,
      loserNextMatchId: null,
      loserDestinationSlot: null,
    });
  }

  // Semi Finals (2 matches)
  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `R-SF-${i + 1}`,
      round: "SF",
      side: "right",
      position: i,
      nextMatchId: "C-F-1", // Both winners go to Final
      winnerDestinationSlot: "player2", // Right side winner is player2 in Final
      loserNextMatchId: "C-3P-1", // Losers go to 3rd Place
      loserDestinationSlot: "player2", // Right side loser is player2 in 3rd Place
    });
  }

  // CENTER - FINAL
  matches.push({
    id: "C-F-1",
    round: "Final",
    side: "center",
    position: 0,
    nextMatchId: null, // No next match
    winnerDestinationSlot: null,
    loserNextMatchId: null,
    loserDestinationSlot: null,
  });

  // CENTER - 3RD PLACE
  matches.push({
    id: "C-3P-1",
    round: "3rdPlace",
    side: "center",
    position: 1,
    nextMatchId: null, // No next match
    winnerDestinationSlot: null,
    loserNextMatchId: null,
    loserDestinationSlot: null,
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
    loserNextMatchId: def.loserNextMatchId,
    loserDestinationSlot: def.loserDestinationSlot,
    scheduledTime: null,
    completedTime: null,
  }));

  await Match.insertMany(matches);
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

    // Check that loserNextMatchId exists (if not null)
    if (match.loserNextMatchId && !matchIds.has(match.loserNextMatchId)) {
      console.error(`❌ Invalid loserNextMatchId: ${match.id} -> ${match.loserNextMatchId}`);
      isValid = false;
    }

    // Check that winnerDestinationSlot is set when nextMatchId exists
    if (match.nextMatchId && !match.winnerDestinationSlot) {
      console.error(`❌ Missing winnerDestinationSlot: ${match.id}`);
      isValid = false;
    }

    // Check that loserDestinationSlot is set when loserNextMatchId exists
    if (match.loserNextMatchId && !match.loserDestinationSlot) {
      console.error(`❌ Missing loserDestinationSlot: ${match.id}`);
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
  const result = await Match.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} existing matches`);
}

async function printSummary() {
  console.log("\n=== BRACKET SUMMARY ===");

  const rounds: Round[] = ["R16", "QF", "SF", "Final", "3rdPlace"];

  for (const round of rounds) {
    const count = await Match.countDocuments({ round });
    console.log(`${round}: ${count} matches`);
  }

  const total = await Match.countDocuments();
  console.log(`\nTotal: ${total} matches`);

  console.log("\n=== SAMPLE MATCHES ===");
  const samples = await Match.find().limit(5);
  samples.forEach((match) => {
    console.log(
      `${match.id} (${match.round}, ${match.side}) -> Next: ${match.nextMatchId || "None"} (${match.winnerDestinationSlot || "N/A"})`
    );
  });
}

async function main() {
  try {
    console.log("🏁 Starting bracket seeding...\n");

    // Connect to MongoDB
    await connectDB();

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

    console.log("\n✅ Bracket seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding:");
    console.error(error);
    process.exit(1);
  }
}

main();
