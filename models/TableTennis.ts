import mongoose, { Schema, Document, Model } from "mongoose";

export type TTRound = "R16" | "QF" | "SF" | "Final";
export type TTSide = "left" | "right" | "center";
export type TTStatus = "scheduled" | "live" | "completed";
export type TTSlot = "player1" | "player2";

export interface ITableTennis extends Document {
  id: string;
  round: TTRound;
  side: TTSide;
  position: number;

  player1: string | null;
  player2: string | null;
  score1: number | null;
  score2: number | null;
  status: TTStatus;

  nextMatchId: string | null;
  winnerDestinationSlot: TTSlot | null;

  scheduledTime: Date | null;
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
      index: true,
    },
    round: {
      type: String,
      enum: ["R16", "QF", "SF", "Final"],
      required: true,
    },
    side: {
      type: String,
      enum: ["left", "right", "center"],
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
    scheduledTime: {
      type: Date,
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

// Compound index for efficient queries
TableTennisSchema.index({ round: 1, side: 1, position: 1 });

// Instance method to determine the winner
TableTennisSchema.methods.determineWinner = function (): string | null {
  if (
    this.score1 === null ||
    this.score2 === null ||
    this.score1 === this.score2
  ) {
    return null;
  }
  return this.score1 > this.score2 ? this.player1 : this.player2;
};

// Instance method to check if score can be updated
TableTennisSchema.methods.canUpdateScore = function (): boolean {
  return (
    this.player1 !== null &&
    this.player2 !== null &&
    this.status !== "completed"
  );
};

// Virtual field for winner (computed property)
TableTennisSchema.virtual("winner").get(function () {
  return this.determineWinner();
});

// Virtual field for isComplete
TableTennisSchema.virtual("isComplete").get(function () {
  return this.status === "completed";
});

// Configure virtuals to be included in JSON
TableTennisSchema.set("toJSON", { virtuals: true });
TableTennisSchema.set("toObject", { virtuals: true });

const TableTennis =
  (mongoose.models.TableTennis as TableTennisModel) ||
  mongoose.model<ITableTennis, TableTennisModel>("TableTennis", TableTennisSchema);

export default TableTennis;
