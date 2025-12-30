# Kite Games Studio - FIFA Tournament Scorecard

A tournament bracket platform with automatic winner advancement, featuring a mirrored World Cup 2014-style layout.

## Features

- **Mirrored Bracket Layout**: 3-column grid (Left/Center/Right) with converging design
- **Auto-Advance Logic**: Winners automatically move to the next match
- **Graph-Based Schema**: Doubly linked list structure for efficient bracket navigation
- **Admin Dashboard**: Easy score management with real-time updates
- **Dark Theme**: Neon green, cyan, and purple color scheme
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Next.js 15** (App Router)
- **MongoDB** with Mongoose
- **Tailwind CSS** + Shadcn UI
- **TypeScript**
- **Server Actions** for data mutations

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

You have two options:

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# The .env.local is already configured for local MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tournament-scorecard
```

### 3. Seed the Database

```bash
npm run seed
```

This creates 30 matches with proper linkage:
- 16 x R16 matches (8 left, 8 right)
- 8 x QF matches (4 left, 4 right)
- 4 x SF matches (2 left, 2 right)
- 1 x Final + 1 x 3rd Place

### 4. Add Players to R16 Matches

You need to manually add players to the Round of 16 matches. You can do this via:

**MongoDB Compass** (GUI):
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select the `tournament-scorecard` database
4. Select the `matches` collection
5. Edit each R16 match to add `player1` and `player2`

**Or via Admin Dashboard**:
The platform is ready for you to add players through the admin interface once you extend the `setInitialPlayers` server action.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the tournament bracket.

## Project Structure

```
kite-scoreboard/
├── app/
│   ├── actions/
│   │   └── match-actions.ts        # Server actions (updateScore, getAllMatches, etc.)
│   ├── admin/
│   │   └── page.tsx                # Admin dashboard
│   ├── page.tsx                    # Public bracket view
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Dark theme + neon styles
├── components/
│   ├── bracket/
│   │   ├── TournamentBracket.tsx   # 3-column grid layout
│   │   ├── MatchCard.tsx           # Individual match display
│   │   └── RoundColumn.tsx         # Round organization
│   ├── admin/
│   │   ├── ScoreInput.tsx          # Score input form
│   │   └── MatchTable.tsx          # Admin table view
│   └── ui/                         # Shadcn components
├── lib/
│   ├── mongodb.ts                  # MongoDB connection
│   └── utils.ts                    # Utility functions
├── models/
│   └── Match.ts                    # Mongoose schema (doubly linked list)
├── scripts/
│   └── seed-bracket.ts             # Bracket seeding script
└── .env.local                      # MongoDB connection string
```

## How It Works

### The Match Schema (Doubly Linked List)

Each match is a node in a graph:

```typescript
{
  id: "L-R16-1",                   // Manual ID for debugging
  round: "R16",                    // Round type
  side: "left",                    // Position in bracket
  player1: "Player A",
  player2: "Player B",
  score1: 3,
  score2: 1,
  status: "completed",
  nextMatchId: "L-QF-1",           // Where winner advances
  winnerDestinationSlot: "player1", // Which slot in next match
  loserNextMatchId: "C-3P-1",      // For SF losers → 3rd place
  loserDestinationSlot: "player2"
}
```

### Auto-Advance Logic

When you update a match score:

1. **Update Current Match**: Set scores and status='completed'
2. **Determine Winner**: Higher score wins (ties not allowed)
3. **Find Next Match**: Use `nextMatchId` to locate the next match
4. **Update Next Match**: Place winner in correct slot (`winnerDestinationSlot`)
5. **Handle Losers** (SF only): Place loser in 3rd place match
6. **Revalidate UI**: Refresh both public and admin pages

Example flow:
```
L-R16-1: Player A (3) vs Player B (1)
  ↓ Winner: Player A
L-QF-1: player1 = "Player A"
  ↓ (when L-R16-2 completes)
L-QF-1: player1 = "Player A", player2 = "Winner of L-R16-2"
```

### Mirrored Bracket Layout

```
     LEFT SIDE          CENTER        RIGHT SIDE
┌─────────────────┐               ┌─────────────────┐
│  R16 → QF → SF  │  → FINAL ←    │  SF ← QF ← R16  │
│                 │  → 3RD PL ←   │                 │
└─────────────────┘               └─────────────────┘
```

## Using the Platform

### Public Bracket View (`/`)

- View the entire tournament bracket
- See live match status (scheduled/live/completed)
- Winners highlighted in neon green
- Auto-refreshes every 30 seconds

### Admin Dashboard (`/admin`)

- Update match scores
- "Save & Advance" automatically moves winners
- Reset completed matches
- View all matches in table format
- Grouped by round (R16, QF, SF, Final, 3rd Place)

## Key Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run seed       # Seed bracket structure
npm run lint       # Run ESLint
```

## Data Flow Example

```
Admin enters score for L-R16-1:
  Player A: 3
  Player B: 1

Server Action (updateScore):
  1. Update L-R16-1: score1=3, score2=1, status='completed'
  2. Winner: Player A (3 > 1)
  3. Find nextMatchId: "L-QF-1"
  4. Update L-QF-1: player1 = "Player A"
  5. Revalidate paths: /, /admin

UI Updates:
  - L-R16-1 shows completed with Player A highlighted
  - L-QF-1 shows Player A in slot 1
  - Both pages refresh automatically
```

## Customization

### Add More Rounds

Edit `scripts/seed-bracket.ts` to add more rounds (e.g., R32 for 32 teams).

### Change Colors

Edit `app/globals.css` CSS variables:
- `--primary`: Neon green (winner highlight)
- `--secondary`: Neon cyan (live matches)
- `--accent`: Neon purple (accents)

### Add Authentication

Protect the `/admin` route using NextAuth.js or similar.

### Real-time Updates

Add Server-Sent Events or WebSocket support for instant bracket updates.

## Troubleshooting

### "Error Loading Bracket"

- Make sure MongoDB is running: `brew services start mongodb-community`
- Check connection string in `.env.local`
- Run seeding script: `npm run seed`

### "Cannot update score"

- Ensure both players are set in the match
- Match must not be already completed
- Scores cannot be tied (different scores required)

### "No matches found"

- Run the seeding script: `npm run seed`
- Check MongoDB connection

## Database Schema Reference

### Match Collection

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Manual ID (e.g., "L-R16-1") |
| `round` | Enum | R16, QF, SF, Final, 3rdPlace |
| `side` | Enum | left, right, center |
| `position` | Number | 0-7 for R16, etc. |
| `player1` | String | First player name |
| `player2` | String | Second player name |
| `score1` | Number | First player score |
| `score2` | Number | Second player score |
| `status` | Enum | scheduled, live, completed |
| `nextMatchId` | String | Where winner advances |
| `winnerDestinationSlot` | Enum | player1 or player2 |
| `loserNextMatchId` | String | Where loser goes (SF only) |
| `loserDestinationSlot` | Enum | player1 or player2 |

## Next Steps

1. **Add Players**: Populate R16 matches with player names
2. **Start Tournament**: Update match scores via `/admin`
3. **Watch Auto-Advance**: Winners automatically progress through bracket
4. **Customize Design**: Adjust colors, animations, layout
5. **Deploy**: Host on Vercel with MongoDB Atlas

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
