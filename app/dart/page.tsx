"use client"

import { useState } from "react"

export default function DartScoreboard() {
  const [rounds, setRounds] = useState([{ players: [] }])
  const [activeRound, setActiveRound] = useState(0)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(null)
  const [playerName, setPlayerName] = useState("")
  const [tempScore, setTempScore] = useState(0)
  const [audienceMode, setAudienceMode] = useState(false)

  const isLocked = (roundIndex) => roundIndex < rounds.length - 1

  const currentPlayers = [...rounds[activeRound].players].sort(
    (a, b) => b.score - a.score
  )
  const qualifyCount = Math.ceil(currentPlayers.length / 2)

  const addPlayer = () => {
    if (!playerName.trim()) return
    const updated = [...rounds]
    updated[0].players.push({ name: playerName, score: 0 })
    setRounds(updated)
    setPlayerName("")
  }

  const saveScore = () => {
    if (isLocked(activeRound)) return
    const updated = [...rounds]
    updated[activeRound].players[showScoreModal].score = tempScore
    setRounds(updated)
    setShowScoreModal(null)
  }

  const endRound = () => {
    const qualified = currentPlayers.slice(0, qualifyCount)
    setRounds([
      ...rounds,
      { players: qualified.map((p) => ({ ...p, score: 0 })) }
    ])
    setActiveRound(activeRound + 1)
  }

  return (
    <div style={audienceMode ? styles.pageAudience : styles.page}>
      <h1 style={styles.title}>🎯 Dart Tournament Scoreboard</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        {rounds.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveRound(i)}
            style={{
              ...styles.tab,
              background: i === activeRound ? "#16a34a" : "#020617"
            }}>
            Round {i + 1}
          </button>
        ))}
      </div>

      {!audienceMode && activeRound === 0 && (
        <button
          style={styles.secondaryBtn}
          onClick={() => setShowPlayerModal(true)}>
          ➕ Add Players
        </button>
      )}

      {!audienceMode && (
        <button
          style={styles.audienceBtn}
          onClick={() => setAudienceMode(true)}>
          📺 Audience Mode
        </button>
      )}

      {/* Scoreboard */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentPlayers.map((p, i) => (
                <tr
                  key={i}
                  style={{
                    ...styles.row,
                    ...(i === 0 ? styles.goldRow : {}),
                    ...(i === 1 ? styles.silverRow : {}),
                    ...(i === 2 ? styles.bronzeRow : {})
                  }}>
                  <td style={{ textAlign: "center" }}>
                    {i === 0 ? <span style={styles.crown}>👑</span> : i + 1}
                  </td>
                  <td style={styles.playerCell}>{p.name}</td>
                  <td style={styles.scoreCell}>{p.score}</td>
                  <td>
                    <button
                      style={styles.iconBtn}
                      onClick={() => {
                        setTempScore(p.score)
                        setShowScoreModal(i)
                      }}>
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!audienceMode && currentPlayers.length > 1 && (
        <button style={styles.primaryBtn} onClick={endRound}>
          End Round → Qualify Next Round
        </button>
      )}

      {/* Player Modal */}
      {showPlayerModal && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <h2>Add Players (Round 1)</h2>
            <div style={styles.modalRow}>
              <input
                style={styles.input}
                value={playerName}
                placeholder='Player name'
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <button style={styles.primaryBtn} onClick={addPlayer}>
                Add
              </button>
            </div>
            <ul style={styles.list}>
              {rounds[0].players.map((p, i) => (
                <li key={i}>{p.name}</li>
              ))}
            </ul>
            <button
              style={styles.secondaryBtn}
              onClick={() => setShowPlayerModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal !== null && (
        <div style={styles.backdrop}>
          <div style={styles.modalSmall}>
            <h3>Edit Score</h3>
            <input
              type='number'
              style={styles.input}
              value={tempScore}
              onChange={(e) => setTempScore(Number(e.target.value))}
            />
            <div style={styles.modalActions}>
              <button
                style={styles.secondaryBtn}
                onClick={() => setShowScoreModal(null)}>
                Cancel
              </button>
              <button style={styles.primaryBtn} onClick={saveScore}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  crown: {
    display: "inline-block",
    fontSize: 26,
    animation: "crownBounce 1.2s infinite ease-in-out"
  },
  goldRow: {
    boxShadow: "0 0 18px rgba(255,215,0,0.6)",
    background: "linear-gradient(90deg, rgba(255,215,0,0.15), rgba(2,6,23,0.9))"
  },
  silverRow: {
    boxShadow: "0 0 14px rgba(192,192,192,0.5)",
    background:
      "linear-gradient(90deg, rgba(192,192,192,0.12), rgba(2,6,23,0.9))"
  },
  bronzeRow: {
    boxShadow: "0 0 14px rgba(205,127,50,0.5)",
    background:
      "linear-gradient(90deg, rgba(205,127,50,0.12), rgba(2,6,23,0.9))"
  },
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f1e8, #e7dfcf)",
    padding: 40
  },
  pageAudience: {
    minHeight: "100vh",
    background: "#020617",
    padding: 40
  },
  title: {
    fontSize: 36,
    fontWeight: 900,
    textAlign: "center",
    marginBottom: 20
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20
  },
  tab: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    color: "#fff",
    cursor: "pointer"
  },
  card: {
    background: "#020617",
    borderRadius: 24,
    padding: 24,
    maxWidth: 800,
    width: "100%"
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" },
  row: {
    background: "#020617",
    borderRadius: 16,
    transition: "transform 0.3s ease"
  },
  gold: { boxShadow: "0 0 20px rgba(255,215,0,0.8)" },
  silver: { boxShadow: "0 0 20px rgba(192,192,192,0.7)" },
  bronze: { boxShadow: "0 0 20px rgba(205,127,50,0.7)" },
  qualified: { outline: "2px solid #22c55e" },
  eliminated: { opacity: 0.5 },
  playerCell: { fontWeight: 700, color: "#f9fafb", padding: 16 },
  scoreCell: {
    fontSize: 24,
    fontWeight: 900,
    color: "#22c55e",
    textAlign: "center"
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#fff"
  },
  primaryBtn: {
    marginTop: 20,
    padding: "14px 24px",
    borderRadius: 16,
    background: "#16a34a",
    border: "none",
    fontWeight: 800
  },
  secondaryBtn: {
    marginTop: 10,
    padding: "10px 18px",
    borderRadius: 14,
    background: "#1f2937",
    color: "#fff",
    border: "none"
  },
  audienceBtn: {
    marginLeft: 10,
    padding: "10px 18px",
    borderRadius: 14,
    background: "#0f172a",
    color: "#fff",
    border: "none"
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    background: "#020617",
    padding: 30,
    borderRadius: 24,
    width: 420,
    color: "#fff"
  },
  modalSmall: {
    background: "#020617",
    padding: 24,
    borderRadius: 20,
    width: 300,
    color: "#fff"
  },
  modalRow: { display: "flex", gap: 10 },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    background: "#020617",
    border: "1px solid #334155",
    color: "#fff"
  },
  list: { marginTop: 15, color: "#fff" }
}
