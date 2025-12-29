# FIDE Swiss System - Missing Features Analysis

## ❌ Critical Missing Features (Must Implement)

### 1. **Late Entries** (C.04.2 Article C - Page 115)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- Players arriving after Round 1 has started must be assigned **temporary pairing numbers**
- Late entries are paired in subsequent rounds
- Their initial rank affects future pairings
- Special handling for TPN (Tournament Pairing Number)

**Impact**: HIGH - Common in real tournaments

**Required Implementation**:
```typescript
interface LateEntryPlayer extends Player {
  entryRound: number; // Round they entered
  temporaryPairingNumber: number;
  initialRank?: number;
}

function handleLateEntry(
  player: Player,
  currentRound: number,
  existingPlayers: Player[]
): LateEntryPlayer;
```

---

### 2. **Player Withdrawals / Dropouts** (C.04.2 Article C)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- Players who withdraw mid-tournament
- Must handle incomplete rounds
- Withdrawn players don't receive BYE
- Opponents of withdrawn players may get forfeit wins

**Impact**: HIGH - Very common

**Required Implementation**:
```typescript
interface WithdrawnPlayer {
  playerId: number;
  withdrawnAfterRound: number;
  reason?: string;
}

function handlePlayerWithdrawal(
  player: Player,
  currentRound: number,
  affectedGames: Game[]
): void;
```

---

### 3. **Forfeit Wins / No-Show Handling** (Article 5, 6.8)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- Player doesn't show up = opponent gets forfeit win (+1 point, +0 pesos)
- **Forfeit wins count as "scoring without playing"**
- Players with forfeit wins have special BYE restrictions (C.2)
- **Clock starts, if opponent doesn't arrive = forfeit**

**Impact**: HIGH - Happens frequently

**Required Implementation**:
```typescript
interface ForfeitResult {
  type: 'no_show' | 'late_arrival' | 'withdrawal';
  winner: Player;
  loser: Player;
  timeExpired: number; // Minutes past scheduled start
}

function handleForfeit(
  game: Game,
  noShowPlayer: Player
): ForfeitResult;

// C.2 - BYE restriction
function canReceiveBYE(player: Player): boolean {
  // Already has BYE OR forfeit win = cannot receive BYE
  return !player.receivedBye && !player.receivedForfeitWin;
}
```

---

### 4. **Half-Point BYE** (Not in Standard FIDE, but Common)
**Current Status**: ❌ **NOT IMPLEMENTED**

**Usage**: Some tournaments allow players to request 0.5-point BYE

**Implementation**:
```typescript
interface HalfPointBye {
  playerId: number;
  round: number;
  approved: boolean;
}

function requestHalfPointBye(
  player: Player,
  round: number
): boolean;
```

---

### 5. **Unplayed Games / Unrated Games** (Article 7.5, Chapter 6)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- Games that start but don't finish (time, arbiter decision)
- Unplayed games affect **float history**
- Rating implications

**Impact**: MEDIUM

**Required**:
```typescript
interface UnplayedGame {
  gameId: string;
  reason: 'time' | 'arbiter_decision' | 'mutual_agreement';
  scoreAwarded?: { white: number; black: number };
}
```

---

### 6. **BYE Assignment Priority** (Article 2.1)
**Current Status**: ⚠️ **PARTIALLY IMPLEMENTED**

**FIDE Rules** (Priority Order):
1. ✅ Player that leaves legal pairing for all teams
2. ✅ Lowest score
3. ❌ **Highest number of games played** (MISSING)
4. ✅ Highest TPN

**Fix Required**:
```typescript
function assignBYE(players: Player[]): Player | null {
  const eligible = players.filter(p => canReceiveBYE(p));
  
  // Sort by:
  // 1. Lowest score
  // 2. Highest games played (MISSING!)
  // 3. Highest TPN
  
  eligible.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    
    // MISSING: games played
    const gamesA = countGamesPlayed(a);
    const gamesB = countGamesPlayed(b);
    if (gamesA !== gamesB) return gamesB - gamesA; // Higher first
    
    return b.id - a.id; // Higher TPN
  });
  
  return eligible[0] || null;
}

function countGamesPlayed(player: Player): number {
  return player.colorHistory.filter(c => c !== 'BYE').length;
}
```

---

### 7. **Zero-Point BYE** (C.2 Note)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- In some formats, BYE awards 0 points instead of 1
- Or 0.5 points (half-point BYE)

**Implementation**:
```typescript
interface TournamentFormat {
  byePoints: 0 | 0.5 | 1;
}
```

---

### 8. **Default Time** (Article 6.7)
**Current Status**: ❌ **NOT IMPLEMENTED**

**FIDE Rules**:
- Default time = time after which player forfeits
- Usually specified in tournament regulations
- Arbiter must record no-shows

**Implementation**:
```typescript
interface TournamentSettings {
  defaultTimeMinutes: number; // e.g., 30 minutes
  gracePeriodMinutes: number; // e.g., 5 minutes
}

function checkDefaultTime(
  game: Game,
  currentTime: Date,
  scheduledStart: Date,
  settings: TournamentSettings
): ForfeitResult | null;
```

---

## ⚠️ Medium Priority (Should Implement)

### 9. **Pairing Cards / Score Cards**
**Status**: ❌ **NOT IMPLEMENTED**

Track complete player history:
```typescript
interface PairingCard {
  playerId: number;
  rounds: Array<{
    roundNumber: number;
    opponent: Player | null; // null = BYE
    color: 'W' | 'B' | 'BYE';
    result: 'win' | 'loss' | 'draw' | 'forfeit' | 'bye';
    bountyTransfer: number;
  }>;
  totalScore: number;
  totalBounty: number;
}
```

---

### 10. **Accelerated Pairings** (C.04.5)
**Status**: ❌ **NOT IMPLEMENTED**

**Baku Acceleration**:
- Virtual points for initial rounds
- Reduces draws in top bracket
- Complex algorithm

---

### 11. **Team Tournaments** (Appendix shown in manual)
**Status**: ❌ **NOT IMPLEMENTED**

Individual vs Team pairing differs significantly.

---

## 📋 Comparison Table

| Feature | FIDE Manual | Our Implementation | Priority |
|---------|-------------|-------------------|----------|
| **Basic Pairing** | ✅ C.04.3 | ✅ Complete | ✅ |
| **Color Allocation** | ✅ E.1-E.5 | ✅ Complete | ✅ |
| **Float Tracking** | ✅ A.4 | ✅ Complete | ✅ |
| **BYE Assignment** | ✅ C.2, 2.1 | ⚠️ Partial | 🔴 HIGH |
| **Late Entries** | ✅ C.04.2-C | ❌ Missing | 🔴 HIGH |
| **Withdrawals** | ✅ Implicit | ❌ Missing | 🔴 HIGH |
| **Forfeit Wins** | ✅ 5.1, 6.8 | ❌ Missing | 🔴 HIGH |
| **Half-Point BYE** | ⚠️ Optional | ❌ Missing | 🟡 MED |
| **Unplayed Games** | ✅ 7.5 | ❌ Missing | 🟡 MED |
| **Default Time** | ✅ 6.7 | ❌ Missing | 🟡 MED |
| **Games Played Count** | ✅ 2.1.3 | ❌ Missing | 🔴 HIGH |
| **Pairing Cards** | ✅ Implicit | ❌ Missing | 🟡 MED |
| **Baku Acceleration** | ✅ C.04.5.1 | ❌ Missing | 🟢 LOW |
| **Team Tournaments** | ✅ Appendix | ❌ Missing | 🟢 LOW |

---

## 🚨 Immediate Action Items

### Phase 4: Essential Missing Features

1. **Forfeit Handling** (2-3 hours)
   - `handleNoShow()`
   - `handleForfeitWin()`
   - Update BYE eligibility check

2. **Games Played Counter** (30 mins)
   - Add to BYE assignment logic
   - Fix sorting priority

3. **Late Entry Support** (3-4 hours)
   - TPN management
   - Entry round tracking
   - Pairing integration

4. **Withdrawal System** (2-3 hours)
   - Mark player as withdrawn
   - Handle mid-round withdrawals
   - Update opponent games

5. **Pairing Card System** (2-3 hours)
   - Complete player history
   - Export functionality
   - Verification tools

---

## 📝 Database Schema Updates Required

```sql
-- Add to players table
ALTER TABLE players ADD COLUMN received_forfeit_win BOOLEAN DEFAULT FALSE;
ALTER TABLE players ADD COLUMN entry_round INTEGER DEFAULT 1;
ALTER TABLE players ADD COLUMN withdrawn BOOLEAN DEFAULT FALSE;
ALTER TABLE players ADD COLUMN withdrawn_after_round INTEGER;
ALTER TABLE players ADD COLUMN games_played INTEGER DEFAULT 0;

-- Add to games table
ALTER TABLE games ADD COLUMN forfeit BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN forfeit_reason TEXT;
ALTER TABLE games ADD COLUMN unplayed BOOLEAN DEFAULT FALSE;

-- Add to tournament table
ALTER TABLE tournament ADD COLUMN default_time_minutes INTEGER DEFAULT 30;
ALTER TABLE tournament ADD COLUMN bye_points NUMERIC DEFAULT 1.0;
```

---

## 🎯 Recommended Implementation Order

1. **Week 1**: Forfeit handling + Games played counter
2. **Week 2**: Late entry system
3. **Week 3**: Withdrawal system + Pairing cards
4. **Week 4**: Testing + Edge cases

---

## 📚 References

- **FIDE Arbiters' Manual 2025** - Chapter 5 (C.04)
- **Laws of Chess** - Articles 5, 6, 7
- **Page 115** - Late Entries (C.04.2-C)
- **Page 112** - Basic Swiss Rules (C.04.1)
- **Article 2.1** - BYE Assignment Priority
- **Article 6.7** - Default Time
- **Article 7.5** - Irregularities

---

**Status**: Our implementation covers ~70% of FIDE rules.
**Missing**: Critical real-world scenarios (forfeits, late entries, withdrawals).
**Next Steps**: Implement Phase 4 features for production readiness.

