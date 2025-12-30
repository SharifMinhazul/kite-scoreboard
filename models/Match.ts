import mongoose, { Schema, Document, Model } from "mongoose";

export type Round = "R16" | "QF" | "SF" | "Final" | "3rdPlace";
export type Side = "left" | "right" | "center";
export type MatchStatus = "scheduled" | "live" | "completed";
export type Slot = "player1" | "player2";

export interface IMatch extends Document {
  id: string;
  round: Round;
  side: Side;
  position: number;

  player1: string | null;
  player2: string | null;
  score1: number | null;
  score2: number | null;
  status: MatchStatus;

  nextMatchId: string | null;
  winnerDestinationSlot: Slot | null;
  loserNextMatchId: string | null;
  loserDestinationSlot: Slot | null;

  scheduledTime: Date | null;
  completedTime: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface IMatchMethods {
  determineWinner(): string | null;
  canUpdateScore(): boolean;
}

type MatchModel = Model<IMatch, {}, IMatchMethods>;

const MatchSchema = new Schema<IMatch, MatchModel, IMatchMethods>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    round: {
      type: String,
      enum: ["R16", "QF", "SF", "Final", "3rdPlace"],
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
    loserNextMatchId: {
      type: String,
      default: null,
    },
    loserDestinationSlot: {
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
MatchSchema.index({ round: 1, side: 1, position: 1 });

// Instance method to determine the winner
MatchSchema.methods.determineWinner = function (): string | null {
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
MatchSchema.methods.canUpdateScore = function (): boolean {
  return (
    this.player1 !== null &&
    this.player2 !== null &&
    this.status !== "completed"
  );
};

// Virtual field for winner (computed property)
MatchSchema.virtual("winner").get(function () {
  return this.determineWinner();
});

// Virtual field for isComplete
MatchSchema.virtual("isComplete").get(function () {
  return this.status === "completed";
});

// Configure virtuals to be included in JSON
MatchSchema.set("toJSON", { virtuals: true });
MatchSchema.set("toObject", { virtuals: true });

const Match = (mongoose.models.Match as MatchModel) ||
  mongoose.model<IMatch, MatchModel>("Match", MatchSchema);

export default Match;
