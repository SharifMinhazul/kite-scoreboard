import mongoose, { Schema, Document, Model } from "mongoose";

export type TTRound = "R16" | "QF" | "SF" | "Final";
export type TTStatus = "scheduled" | "live" | "completed";

export interface ITableTennis extends Document {
  id: string; // Manual ID: "TT-R16-1", "TT-QF-1", "TT-SF-1", "TT-F-1"
  round: TTRound;
  position: number; // Position within the round (0-7 for R16, 0-3 for QF, etc.)

  player1: string | null;
  player2: string | null;
  score1: number | null;
  score2: number | null;
  status: TTStatus;

  // Graph pointers for auto-advance
  nextMatchId: string | null; // Where winner advances
  winnerDestinationSlot: "player1" | "player2" | null; // Which slot in next match

  completedTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITableTennisMethods {
  determineWinner(): string | null;
  canUpdateScore(): boolean;
}

type TableTennisModel = Model<ITableTennis, {}, ITableTennisMethods>;

const TableTennisSchema = new Schema<ITableTennis, TableTennisModel, ITableTennisMethods>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    round: {
      type: String,
      enum: ["R16", "QF", "SF", "Final"],
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    player1: {
      type: String,
      default: null,
    },
    player2: {
      type: String,
      default: null,
    },
    score1: {
      type: Number,
      default: null,
    },
    score2: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },
    nextMatchId: {
      type: String,
      default: null,
    },
    winnerDestinationSlot: {
      type: String,
      enum: ["player1", "player2"],
      default: null,
    },
    completedTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Determine the winner of the match
TableTennisSchema.methods.determineWinner = function (): string | null {
  if (this.score1 === null || this.score2 === null) return null;
  if (this.score1 === this.score2) return null; // Tie (shouldn't happen)
  return this.score1 > this.score2 ? this.player1 : this.player2;
};

// Check if the match can be updated
TableTennisSchema.methods.canUpdateScore = function (): boolean {
  return (
    this.player1 !== null &&
    this.player2 !== null &&
    this.status !== "completed"
  );
};

const TableTennis =
  (mongoose.models.TableTennis as TableTennisModel) ||
  mongoose.model<ITableTennis, TableTennisModel>("TableTennis", TableTennisSchema);

export default TableTennis;
