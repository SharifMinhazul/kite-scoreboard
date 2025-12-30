// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "../lib/mongodb";
import Match from "../models/Match";

// Sample player names - replace with your actual players
const samplePlayers = [
  "Cristiano Ronaldo", "Lionel Messi", "Neymar Jr", "Kylian Mbappé",
  "Erling Haaland", "Kevin De Bruyne", "Mohamed Salah", "Robert Lewandowski",
  "Luka Modrić", "Karim Benzema", "Virgil van Dijk", "Sadio Mané",
  "Harry Kane", "Bruno Fernandes", "Son Heung-min", "Toni Kroos",
  "Joshua Kimmich", "N'Golo Kanté", "Paul Pogba", "Raheem Sterling",
  "Antoine Griezmann", "Luis Suárez", "Eden Hazard", "Sergio Ramos",
  "Thibaut Courtois", "Jan Oblak", "Alisson Becker", "Manuel Neuer",
  "Casemiro", "Frenkie de Jong", "João Félix", "Phil Foden"
];

async function addPlayers() {
  try {
    console.log("🏁 Starting player assignment...\n");

    await connectDB();

    // Get all R16 matches
    const r16Matches = await Match.find({ round: "R16" }).sort({ side: 1, position: 1 });

    if (r16Matches.length === 0) {
      console.error("❌ No R16 matches found! Please run 'npm run seed' first.");
      process.exit(1);
    }

    console.log(`Found ${r16Matches.length} R16 matches\n`);

    // Assign players (2 players per match)
    let playerIndex = 0;

    for (const match of r16Matches) {
      if (playerIndex >= samplePlayers.length - 1) {
        console.log("⚠️  Ran out of sample players. Add more to the array!");
        break;
      }

      match.player1 = samplePlayers[playerIndex];
      match.player2 = samplePlayers[playerIndex + 1];
      match.status = "scheduled";

      await match.save();

      console.log(`✅ ${match.id}: ${match.player1} vs ${match.player2}`);

      playerIndex += 2;
    }

    console.log("\n✅ Player assignment completed successfully!");
    console.log("\n🎮 Next steps:");
    console.log("1. Run 'npm run dev'");
    console.log("2. Go to http://localhost:3000/admin");
    console.log("3. Start entering match scores!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error adding players:");
    console.error(error);
    process.exit(1);
  }
}

addPlayers();
