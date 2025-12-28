# 🎯 Pairing System Explained

## Modified Swiss Pairing System

This tournament uses a **Modified Swiss Pairing System** that pairs players based on **bounty amounts** rather than traditional chess points.

---

## How It Works

### 1. **Sorting Players**
Before each round, all players are sorted by:
- **Primary**: Current bounty (highest first)
- **Tiebreaker**: Number of wins

### 2. **Pairing Algorithm**
Starting from the top (highest bounty):
- Each player is paired with the next available player they haven't played yet
- The system tries to pair similar bounty amounts (like traditional Swiss)
- **No repeat opponents** (standard Swiss rule is enforced)

### 3. **Handling Odd Numbers (BYE)**
If there's an odd number of players:
- The unpaired player receives a **BYE**
- **BYE rules**:
  - Automatic **1 Win** added to their record
  - **No bounty gain** (bounty stays the same)
  - Cannot receive multiple BYEs in the same tournament (system tries to avoid this)
  - BYE is clearly displayed in the round view

---

## Differences from Traditional Swiss

| Aspect | Traditional Swiss | This Tournament |
|--------|------------------|-----------------|
| **Pairing Basis** | Points/Score | Bounty Amount |
| **Tiebreaker** | Various (Buchholz, etc.) | Wins |
| **Goal** | Accumulate points | Accumulate bounty |
| **BYE Award** | 1 point | 1 win, 0 bounty |
| **No Repeat** | ✅ Yes | ✅ Yes |

---

## Why Modified Swiss?

1. **Fair Competition**: Players with similar bounties face each other
2. **Competitive Pairings**: As bounties change, pairings become more dynamic
3. **No Repeat Rule**: Ensures variety and prevents repeated matchups
4. **Scalable**: Works well with any number of players

---

## BYE Handling

### Visual Indicators:
- **Blue notification box** at the top of the round view
- Shows all players with BYE in that round
- Displays: Player name, surname, and ID

### In Printable Pairings:
- BYE games are listed separately in blue
- Clearly marked as "Automatic Win"

### Example:
```
🎯 Players with BYE (automatic win, no bounty gain):
┌─────────────────────────────────┐
│ John Smith (ID: 15)             │
└─────────────────────────────────┘
```

---

## Technical Notes

- Pairing calculation happens instantly when "Generate Round X Pairing" is clicked
- System validates all pairings before displaying them
- BYE games are auto-completed (no arbiter input needed)
- Player stats are automatically updated when BYE is assigned

---

## Questions?

If you encounter any pairing issues:
1. Check that all previous round games are completed
2. Verify player data is correct
3. Use "Reset Tournament" if testing (WARNING: deletes all data)




