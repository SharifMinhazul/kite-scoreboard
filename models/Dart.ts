import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDartPlayer {
  name: string;
  score: number;
}

export interface IDartRound {
  roundNumber: number;
  players: IDartPlayer[];
  isActive: boolean;
  isCompleted: boolean;
}

export interface IDart extends Document {
  name: string;
  rounds: IDartRound[];
  currentRound: number;
  isFinished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDartMethods {
  getCurrentRound(): IDartRound | null;
  canAddPlayers(): boolean;
  canEditScores(roundNumber: number): boolean;
}

type DartModel = Model<IDart, {}, IDartMethods>;

const DartPlayerSchema = new Schema<IDartPlayer>(
  {
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const DartRoundSchema = new Schema<IDartRound>(
  {
    roundNumber: {
      type: Number,
      required: true,
    },
    players: [DartPlayerSchema],
    isActive: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const DartSchema = new Schema<IDart, DartModel, IDartMethods>(
  {
    name: {
      type: String,
      default: "Dart Tournament",
    },
    rounds: [DartRoundSchema],
    currentRound: {
      type: Number,
      default: 1,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Get the current active round
DartSchema.methods.getCurrentRound = function (): IDartRound | null {
  return this.rounds.find((r) => r.roundNumber === this.currentRound) || null;
};

// Check if players can be added (only to round 1, and only if not completed)
DartSchema.methods.canAddPlayers = function (): boolean {
  const round1 = this.rounds.find((r) => r.roundNumber === 1);
  return !round1?.isCompleted && !this.isFinished;
};

// Check if scores can be edited for a specific round
DartSchema.methods.canEditScores = function (roundNumber: number): boolean {
  const round = this.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) return false;
  return round.isActive && !round.isCompleted && !this.isFinished;
};

const Dart =
  (mongoose.models.Dart as DartModel) ||
  mongoose.model<IDart, DartModel>("Dart", DartSchema);

export default Dart;
