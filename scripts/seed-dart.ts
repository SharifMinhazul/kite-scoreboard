import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import Dart from "../models/Dart";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-scorecard";

async function seedDart() {
  try {
    console.log("🎯 Starting Dart Tournament seeding...");
    console.log("📝 MongoDB URI:", MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Clear existing dart tournaments
    await Dart.deleteMany({});
    console.log("🗑️  Cleared existing dart tournaments");

    // Create initial tournament with Round 1
    const tournament = await Dart.create({
      name: "Dart Tournament",
      rounds: [
        {
          roundNumber: 1,
          players: [],
          isActive: true,
          isCompleted: false,
        },
      ],
      currentRound: 1,
      isFinished: false,
    });

    console.log("✅ Created initial dart tournament");
    console.log("📊 Tournament ID:", tournament._id);
    console.log("🎯 Ready for players to be added!");

    console.log("\n✅ Dart tournament seeding completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Navigate to: /admin/dart");
    console.log("   3. Add players to Round 1");
    console.log("   4. Enter scores and advance rounds");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding dart tournament:", error);
    process.exit(1);
  }
}

seedDart();
