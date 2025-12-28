# ⚡ QUICK TEST GUIDE - 30 Minutes

## 🚀 Start Here (2 min)

```bash
✓ Server running on: http://localhost:3000
✓ Open browser to that URL
```

---

## 📝 TEST 1: Import Players (3 min)

**Steps:**
1. ✓ Click "**Load Sample (37 Players)**"
2. ✓ Click "**Import Players**"
3. ✓ Should navigate to "Manage Players"

**Expected:** 41 players loaded

**Visual Check:**
- IDs from 1-41
- Names displayed
- Some missing birthdates (⚠️ warning)

---

## 📝 TEST 2: Add Player (2 min)

**Steps:**
1. ✓ Click "**Add New Player**"
2. ✓ Fill in:
   - First Name: `TestUser`
   - Last Name: `Demo`
   - Birth Date: `01/01/2010`
   - Gender: `Male`
3. ✓ Click "**Add Player**"

**Expected:** Player #42 added, Age = 14, Category = U16

---

## 📝 TEST 3: Edit Player (2 min)

**Steps:**
1. ✓ Find "TestUser Demo"
2. ✓ Click "**Edit**"
3. ✓ Change birth date to: `15/05/2000`
4. ✓ Click "**Update Player**"

**Expected:** Age changes to 24, Category = Senior

---

## 📝 TEST 4: Delete Player (1 min)

**Steps:**
1. ✓ Find "TestUser Demo"
2. ✓ Click "**Delete**"
3. ✓ Confirm

**Expected:** Back to 41 players

---

## 📝 TEST 5: Start Tournament (2 min)

**Steps:**
1. ✓ Click "**Leaderboard**" in sidebar
2. ✓ Verify all players show:
   - 20₱ bounty
   - 0-0-0 record
   - ⭐ sheriff badge
3. ✓ Click "**Start Tournament**"
4. ✓ Click "**Generate Round 1 Pairings**"

**Expected:** Navigate to "Current Round" with 20 games + 1 BYE

---

## 📝 TEST 6: Normal Win (2 min)

**Game 1 - No Sheriff**

| Before | After (Expected) |
|--------|------------------|
| White: 20₱ | White: 30₱ (+10) |
| Black: 20₱ | Black: 10₱ (-10) |

**Steps:**
1. ✓ Find **first game** in list
2. ✓ Don't check sheriff boxes
3. ✓ Click "**White Wins**"
4. ✓ Click "**Submit Result**"

**Visual Check:**
- Game card turns green
- Shows "Completed"
- Both keep sheriff badge ⭐

---

## 📝 TEST 7: Sheriff Steal (2 min)

**Game 2 - White Uses Sheriff**

| Before | After (Expected) |
|--------|------------------|
| White: 20₱ | White: 32₱ (+12) |
| Black: 20₱ | Black: 10₱ (-10) |

**Steps:**
1. ✓ Find **second game**
2. ✓ **Check "Use Sheriff Badge" for WHITE**
3. ✓ Click "**White Wins**"
4. ✓ Click "**Submit Result**"

**Visual Check:**
- White gains 32₱ (12₱ bonus from sheriff)
- White loses badge (⭐ → ❌)
- Black becomes Angry (⚡)

**Math:** 10 base + (10 × 0.2) = 12₱ gained

---

## 📝 TEST 8: Draw (1 min)

**Game 3 - Draw**

| Before | After (Expected) |
|--------|------------------|
| White: 20₱ | White: 20₱ (no change) |
| Black: 20₱ | Black: 20₱ (no change) |

**Steps:**
1. ✓ Find **third game**
2. ✓ Click "**Draw**"
3. ✓ Click "**Submit Result**"

**Visual Check:**
- Both keep 20₱
- Both get +1 Draw
- Both keep sheriff badges

---

## 📝 TEST 9: U12 Protection (3 min)

**Find a U12 Player (e.g., Lovenah Beharry, age 5)**

| Before | After (Expected) |
|--------|------------------|
| U12: 20₱ | U12: 15₱ (-5, protected!) |
| Winner: 20₱ | Winner: 25₱ (+5) |

**Steps:**
1. ✓ Search for "**Lovenah**" or any U12 player
2. ✓ Their opponent wins (no sheriff)
3. ✓ Submit result

**Visual Check:**
- U12 player only loses 5₱ (25% of 20)
- Winner only gains 5₱
- Normal would be 10₱!

**Rule:** U12 protection only works **Rounds 1-5**

---

## 📝 TEST 10: BYE Player (1 min)

**Check the BYE section**

**Steps:**
1. ✓ Scroll to BYE section (bottom of Current Round)
2. ✓ Note the player name

**Expected:**
- Player gets +1 Win
- Bounty stays 20₱ (NO change!)

---

## 📝 TEST 11: Complete Round 1 (5 min)

**Steps:**
1. ✓ Complete remaining games (mix of wins/draws)
2. ✓ Watch progress bar reach 100%
3. ✓ See "**Round 1 Complete**" message
4. ✓ Click "**Back to Leaderboard**"

**Expected:**
- All games show "Completed"
- Progress bar: 20/20 games

---

## 📝 TEST 12: Check Leaderboard (2 min)

**Visual Check:**
1. ✓ Players sorted by bounty (highest first)
2. ✓ Rank numbers correct (1, 2, 3...)
3. ✓ Bounties match calculations
4. ✓ W/L/D records correct
5. ✓ Some players missing sheriff badge (❌)
6. ✓ Some players Angry (⚡)

**Sample Check:**
- Top player: Should have 30-35₱
- Bottom player: Should have 10-15₱
- Winners: +1 Win
- Losers: +1 Loss
- Draws: +1 Draw

---

## 📝 TEST 13: Round 2 Pairing (2 min)

**Steps:**
1. ✓ Click "**Generate Round 2 Pairings**"
2. ✓ Check pairings

**Visual Check:**
- High bounty players paired together
- Low bounty players paired together
- **NO repeat opponents**
- Different player gets BYE

---

## 📝 TEST 14: Export Data (1 min)

**Steps:**
1. ✓ Click "**Export Data**" in sidebar
2. ✓ File downloads (`.json`)
3. ✓ Open file - verify it has data

**Expected:** JSON with players, rounds, games

---

## 📝 TEST 15: Prizes Preview (1 min)

**Steps:**
1. ✓ Click "**Prizes**" in sidebar
2. ✓ Check categories

**Visual Check:**
- Greatest Criminal = highest bounty
- Most Dangerous Lady = highest bounty female
- Age categories populated
- Preview message shown (tournament not complete)

---

## ✅ Quick Verification Checklist

After completing these 15 tests, verify:

### Math Calculations:
- [ ] Normal win: +10₱ / -10₱
- [ ] Sheriff steal: +12₱ winner
- [ ] U12 protection: only -5₱
- [ ] Draw: no change

### Sheriff Badges:
- [ ] Removed after use
- [ ] Both checked = both removed
- [ ] Not used = kept

### Criminal Status:
- [ ] Normal → Angry (after sheriff used against them)
- [ ] Display: ⚡ icon
- [ ] Color coding correct

### Pairing:
- [ ] Swiss system (by bounty)
- [ ] No repeats
- [ ] BYE rotates

### UI/UX:
- [ ] Material UI looks clean
- [ ] Sidebar navigation works
- [ ] Tables readable
- [ ] Buttons responsive
- [ ] Mobile view works (resize browser)

---

## 🐛 If You Find Issues

**Document:**
1. Test number (1-15)
2. Expected result
3. Actual result
4. Screenshot if possible

**Check:**
- Browser console (F12) for errors
- Network tab for Supabase errors
- Supabase dashboard for data issues

---

## ⏱️ Time Breakdown

| Test | Time | Cumulative |
|------|------|------------|
| 1-4: Player Management | 10 min | 10 min |
| 5-11: Round 1 Complete | 15 min | 25 min |
| 12-15: Verification | 5 min | 30 min |

**Total: ~30 minutes for complete quick test**

---

## 🎯 Success Criteria

**PASS if:**
✓ All 15 tests complete without errors
✓ Math calculations match expected
✓ UI is responsive and clean
✓ No console errors
✓ Data persists correctly

**FAIL if:**
✗ Math is wrong (off by more than 1₱ due to rounding)
✗ Sheriff badges don't work
✗ Pairing has repeats
✗ UI breaks or looks bad
✗ Console shows errors

---

## 🚀 Ready? Start Testing!

1. **Open:** `http://localhost:3000`
2. **Follow:** Tests 1-15 above
3. **Check:** All boxes in verification checklist
4. **Report:** Any issues found

**Good luck!** 🎯


