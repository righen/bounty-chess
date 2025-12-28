# 🧪 Manual Testing Scenarios - Step by Step

## 📌 Quick Start Testing Guide

### Setup (5 minutes)
1. Open browser to `http://localhost:3000`
2. Click "Load Sample (37 Players)"
3. Click "Import Players" 
4. Navigate to "Leaderboard" in sidebar

---

## 🎯 **TEST SCENARIO 1: Basic Game (No Sheriff)**

### Expected Behavior:
- Winner gains **half of loser's bounty**
- Loser loses **half of their bounty**

### Steps:
1. Start Tournament → Generate Round 1
2. Find **first game** in the list
3. Note starting bounties (should both be 20₱)
4. **Don't check** any sheriff boxes
5. Click "White Wins"
6. Click "Submit Result"

### Expected Results:
| Player | Before | After | Change |
|--------|--------|-------|--------|
| White  | 20₱    | 30₱   | +10₱ (gained half of 20) |
| Black  | 20₱    | 10₱   | -10₱ (lost half of 20) |

**✓ Verify:** Both players still have sheriff badge (⭐)

---

## 🎯 **TEST SCENARIO 2: Sheriff Badge Used (Winner)**

### Expected Behavior:
- Winner gains **1.2x** (120%) of loser's bounty
- Loser loses their normal amount (50%)
- Winner **loses sheriff badge**
- Loser becomes "angry" (⚡)

### Steps:
1. Find **second game** in list
2. Note bounties (should be 20₱ each)
3. **Check "Use Sheriff Badge"** for WHITE player
4. Click "White Wins"
5. Click "Submit Result"

### Expected Results:
| Player | Before | After | Sheriff | Criminal Status |
|--------|--------|-------|---------|----------------|
| White  | 20₱    | 32₱   | ❌ USED | Normal |
| Black  | 20₱    | 10₱   | ⭐ Has  | Angry ⚡ |

**Calculation:**
- Black loses: 20 × 0.5 = 10₱
- White gains: 10 × 1.2 = 12₱
- White total: 20 + 12 = **32₱**

---

## 🎯 **TEST SCENARIO 3: Draw**

### Expected Behavior:
- **No bounty change** for either player
- Both get +1 Draw
- Both keep sheriff badges

### Steps:
1. Find **third game**
2. Note bounties
3. Click "Draw"
4. Click "Submit Result"

### Expected Results:
| Player | Bounty | Wins | Losses | Draws |
|--------|--------|------|--------|-------|
| White  | 20₱    | 0    | 0      | 1     |
| Black  | 20₱    | 0    | 0      | 1     |

---

## 🎯 **TEST SCENARIO 4: U12 Protection (Rounds 1-5)**

### Expected Behavior:
- U12 player loses only **25%** of bounty (instead of 50%)
- Winner gains only what the loser loses

### Steps:
1. Find "Lovenah Beharry" (Age 5, U10)
2. Note: She's U12, so gets protection
3. Her opponent wins (no sheriff)

### Expected Results:
| Player | Age | Before | After | Change |
|--------|-----|--------|-------|--------|
| Lovenah| 5   | 20₱    | 15₱   | -5₱ (25% of 20) |
| Opponent| Any | 20₱   | 25₱   | +5₱ |

**✓ Rule:** U12 protection only works **rounds 1-5**

---

## 🎯 **TEST SCENARIO 5: Women/U16 Protection (Rounds 1-5)**

### Expected Behavior:
- Female or U16 players lose only **33%** of bounty
- Winner gains what loser loses

### Steps:
1. Find any female player OR U16 player
2. Check their age/gender
3. Their opponent wins (no sheriff)

### Expected Results:
| Player | Type | Before | After | Change |
|--------|------|--------|-------|--------|
| Protected | F/U16 | 20₱ | 14₱   | -6₱ (33% of 20, rounded down) |
| Opponent  | Any   | 20₱ | 26₱   | +6₱ |

---

## 🎯 **TEST SCENARIO 6: Sheriff Protection (Loser Uses Badge)**

### Expected Behavior:
- Loser is **fully protected** - loses 0₱
- Winner gains **0₱**
- Loser **loses sheriff badge**
- Winner becomes "angry" (⚡)

### Steps:
1. Find a game with two players who have sheriff badges
2. **Check "Use Sheriff Badge"** for BLACK player
3. Click "White Wins"
4. Click "Submit Result"

### Expected Results:
| Player | Before | After | Sheriff | Criminal Status |
|--------|--------|-------|---------|----------------|
| White  | 20₱    | 20₱   | ⭐ Has  | Angry ⚡ |
| Black  | 20₱    | 20₱   | ❌ USED | Normal |

**✓ Black protected themselves - no bounty lost!**

---

## 🎯 **TEST SCENARIO 7: Both Use Sheriff**

### Expected Behavior:
- Sheriff badges **cancel out**
- Normal game rules apply (50% loss)
- Both **lose their badges**

### Steps:
1. Find a game with two players with badges
2. **Check BOTH sheriff boxes**
3. White wins

### Expected Results:
| Player | Before | After | Sheriff |
|--------|--------|-------|---------|
| White  | 20₱    | 30₱   | ❌ USED |
| Black  | 20₱    | 10₱   | ❌ USED |

---

## 🎯 **TEST SCENARIO 8: BYE (Automatic Win)**

### Expected Behavior:
- Player gets +1 Win
- Bounty stays **exactly the same** (no change)

### Steps:
1. In Round 1, check the BYE section (41 players = 1 BYE)
2. Note the BYE player's name
3. Go back to Leaderboard after round

### Expected Results:
| Player | Wins | Losses | Draws | Bounty |
|--------|------|--------|-------|--------|
| BYE Player | 1 | 0   | 0     | 20₱ (no change) |

---

## 🎯 **TEST SCENARIO 9: Criminal Status Escalation**

### Expected Behavior:
- Normal → Sheriff used against them → **Angry** ⚡
- Angry → Sheriff used against them → **Mad** ⚡⚡
- Mad → Sheriff doesn't work on them (immune!)

### Steps:
**Phase 1: Make someone Angry**
1. Player A uses sheriff to steal from Player B
2. Player B becomes Angry ⚡

**Phase 2: Make them Mad**
3. Next round, someone uses sheriff against Player B again
4. Player B becomes Mad ⚡⚡

**Phase 3: Test Immunity**
5. Next round, someone tries to use sheriff against Mad Player B
6. Sheriff **doesn't work** - normal game rules apply

---

## 🎯 **TEST SCENARIO 10: High/Low Bounty Edge Cases**

### Expected Behavior:
- Player with **0-2₱**: loses everything
- Player with **high bounty**: calculations still work

### Test Case A: Near-Zero Bounty
| Player | Before | Loses | After |
|--------|--------|-------|-------|
| Poor   | 2₱     | 2₱    | 0₱    |
| Rich   | 60₱    | 0₱    | 62₱   |

### Test Case B: Very High Bounty
| Player | Before | Loses 50% | After |
|--------|--------|-----------|-------|
| Rich   | 80₱    | 40₱       | 40₱   |
| Winner | 20₱    | +40₱      | 60₱   |

---

## 🎯 **TEST SCENARIO 11: Pairing Algorithm (Round 2+)**

### Expected Behavior:
- **Swiss pairing**: similar scores play each other
- **No repeat opponents**
- **Different BYE** player each round (if odd number)

### Steps:
1. Complete Round 1
2. Generate Round 2
3. Check pairings

### Verify:
- [ ] Top bounty players paired together
- [ ] Bottom bounty players paired together
- [ ] No player faces same opponent twice
- [ ] Different player gets BYE

---

## 🎯 **TEST SCENARIO 12: After Round 5 (Protection Ends)**

### Expected Behavior:
- After Round 5, **ALL protections end**
- U12, Women, U16 **lose 50%** like everyone else

### Steps:
1. Complete Rounds 1-5
2. In Round 6, test a U12 player losing

### Expected Results (Round 6):
| Player | Age | Before | After | Change |
|--------|-----|--------|-------|--------|
| U12    | 10  | 20₱    | 10₱   | -10₱ (50% - NO protection!) |

**✓ Protection only works Rounds 1-5!**

---

## 🎯 **TEST SCENARIO 13: Data Export/Import**

### Steps:
1. Complete 2-3 rounds
2. Click "Export Data" in sidebar
3. Note player bounties
4. Click "Reset Tournament"
5. Click "Import Data"
6. Select exported JSON file

### Verify:
- [ ] All players restored
- [ ] All bounties match
- [ ] All rounds match
- [ ] All game results match
- [ ] Current round correct

---

## 🎯 **TEST SCENARIO 14: Real-Time Sync**

### Steps:
1. Open app in **two browser tabs**
2. In Tab 1: Submit a game result
3. Watch Tab 2

### Verify:
- [ ] Tab 2 shows "Syncing..." indicator
- [ ] Tab 2 updates automatically
- [ ] Leaderboard updates in both tabs
- [ ] Bounties match in both tabs

---

## 🎯 **TEST SCENARIO 15: Mobile Responsiveness**

### Steps:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12" or similar

### Verify:
- [ ] Sidebar collapses to hamburger menu
- [ ] Leaderboard shows cards (not table)
- [ ] Game cards stack vertically
- [ ] All buttons are tappable (min 44px)
- [ ] No horizontal scrolling
- [ ] Text is readable (min 14px)

---

## 📊 Quick Math Reference

### Bounty Loss Rates:
- **Normal**: 50% of bounty
- **U12 (Rounds 1-5)**: 25% of bounty
- **Women/U16 (Rounds 1-5)**: 33% of bounty
- **After Round 5**: Everyone 50%
- **Sheriff Steal**: 120% (1.2x)
- **Sheriff Protection**: 0% (full protection)

### Examples:
| Bounty | Normal Loss | U12 Loss | W/U16 Loss | Sheriff Steal |
|--------|-------------|----------|------------|---------------|
| 20₱    | 10₱         | 5₱       | 6₱         | 12₱           |
| 40₱    | 20₱         | 10₱      | 13₱        | 24₱           |
| 60₱    | 30₱         | 15₱      | 20₱        | 36₱           |

---

## ✅ Testing Completion Checklist

### Must Test:
- [ ] Import 41 players
- [ ] Add/Edit/Delete player
- [ ] Start tournament
- [ ] Complete at least 5 rounds
- [ ] Test all 15 scenarios above
- [ ] Check final prizes page
- [ ] Export and import data
- [ ] Test on mobile

### Time Estimate:
- **Quick test** (main features): 30 minutes
- **Full test** (all scenarios): 2 hours
- **Complete tournament** (9 rounds): 3+ hours

---

## 🐛 Common Issues to Watch For:

1. **Math errors**: Bounty calculations off by 1-2₱
2. **Sheriff badge**: Not removed after use
3. **Criminal status**: Not updating correctly
4. **Pairing**: Repeat opponents
5. **BYE**: Player gains bounty (should be 0)
6. **Protection**: Still working after Round 5
7. **Negative bounty**: Player drops below 0₱
8. **Real-time**: Changes not syncing

---

**Ready to test? Open the app and start with Scenario 1!** 🚀


