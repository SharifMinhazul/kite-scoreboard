import mongoose, { Schema, Document, Model } from "mongoose";

export type GroupName = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface IGroupPlayer {
  name: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface IGroup extends Document {
  name: GroupName;
  players: IGroupPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMethods {
  calculateStandings(): IGroupPlayer[];
  getTopTwoPlayers(): string[];
}

type GroupModel = Model<IGroup, {}, IGroupMethods>;

const GroupPlayerSchema = new Schema<IGroupPlayer>(
  {
    name: {
      type: String,
      required: true,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    goalsFor: {
      type: Number,
      default: 0,
    },
    goalsAgainst: {
      type: Number,
      default: 0,
    },
    goalDifference: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroup, GroupModel, IGroupMethods>(
  {
    name: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F", "G", "H"],
      required: true,
      unique: true,
    },
    players: [GroupPlayerSchema],
  },
  {
    timestamps: true,
  }
);

// Calculate and sort standings
GroupSchema.methods.calculateStandings = function (): IGroupPlayer[] {
  return [...this.players].sort((a, b) => {
    // Sort by points (descending)
    if (b.points !== a.points) return b.points - a.points;
    // If points are equal, sort by goal difference
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // If goal difference is equal, sort by goals scored
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // If all equal, maintain current order
    return 0;
  });
};

// Get top 2 players who qualify for R16
GroupSchema.methods.getTopTwoPlayers = function (): string[] {
  const standings = this.calculateStandings();
  return standings.slice(0, 2).map((p) => p.name);
};

const Group = (mongoose.models.Group as GroupModel) ||
  mongoose.model<IGroup, GroupModel>("Group", GroupSchema);

export default Group;
