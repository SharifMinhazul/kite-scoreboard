import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import TableTennisGroup from "../models/TableTennisGroup";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-scorecard";

async function seedTTGroups() {
  try {
    console.log("🏓 Starting Table Tennis Groups seeding...");
    console.log("📝 MongoDB URI:", MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Clear existing groups
    await TableTennisGroup.deleteMany({});
    console.log("🗑️  Cleared existing table tennis groups");

    // Create 8 groups (A through H)
    const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const groups = [];

    for (const name of groupNames) {
      const group = await TableTennisGroup.create({
        name,
        players: [],
      });
      groups.push(group);
      console.log(`✅ Created Group ${name}`);
    }

    console.log("\n✅ Table Tennis groups seeding completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Navigate to: /admin/table-tennis/groups/setup");
    console.log("   3. Add players to each group");
    console.log("   4. Enter match results");
    console.log("   5. Advance top 2 from each group to R16");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding table tennis groups:", error);
    process.exit(1);
  }
}

seedTTGroups();
