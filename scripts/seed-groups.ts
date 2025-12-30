// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "../lib/mongodb";
import Group, { GroupName, IGroupPlayer } from "../models/Group";

// Sample players for each group (you can customize these)
const groupPlayers: Record<GroupName, string[]> = {
  A: ["Cristiano Ronaldo", "Lionel Messi", "Neymar Jr", "Kylian Mbappé"],
  B: ["Erling Haaland", "Kevin De Bruyne", "Mohamed Salah", "Robert Lewandowski"],
  C: ["Luka Modrić", "Karim Benzema", "Virgil van Dijk", "Sadio Mané"],
  D: ["Harry Kane", "Bruno Fernandes", "Son Heung-min", "Toni Kroos"],
  E: ["Joshua Kimmich", "N'Golo Kanté", "Paul Pogba", "Raheem Sterling"],
  F: ["Antoine Griezmann", "Luis Suárez", "Eden Hazard", "Sergio Ramos"],
  G: ["Thibaut Courtois", "Jan Oblak", "Alisson Becker", "Manuel Neuer"],
  H: ["Casemiro", "Frenkie de Jong", "João Félix", "Phil Foden"],
};

async function seedGroups() {
  try {
    console.log("🏁 Starting group stage seeding...\n");

    await connectDB();

    // Clear existing groups
    await Group.deleteMany({});
    console.log("✅ Cleared existing groups\n");

    const groupNames: GroupName[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (const groupName of groupNames) {
      const players: IGroupPlayer[] = groupPlayers[groupName].map((name) => ({
        name,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      }));

      const group = new Group({
        name: groupName,
        players,
      });

      await group.save();

      console.log(`✅ Group ${groupName} created with ${players.length} players:`);
      players.forEach((p, i) => console.log(`   ${i + 1}. ${p.name}`));
      console.log();
    }

    console.log("✅ Group stage seeding completed successfully!\n");
    console.log("📊 Next steps:");
    console.log("1. Go to http://localhost:3000/groups to view group standings");
    console.log("2. Go to http://localhost:3000/admin/groups to enter match results");
    console.log("3. Top 2 from each group will advance to Round of 16");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding groups:");
    console.error(error);
    process.exit(1);
  }
}

seedGroups();
