# 🧪 Bounty Chess Tournament - Complete Testing Checklist

## ✅ Phase 1: Player Import & Management

### 1.1 CSV Import
- [ ] Navigate to home page - should show "Import Players"
- [ ] Click "Load Sample (37 Players)" button
- [ ] Verify CSV data appears in text area
- [ ] Click "Import Players" button
- [ ] Verify success: should navigate to "Manage Players" view
- [ ] Verify player count: should show 41 players

### 1.2 Player Data Validation
- [ ] Check player IDs are sequential (1-41)
- [ ] Check all names are displayed correctly
- [ ] Check birthdates are parsed (DD/MM/YYYY format)
- [ ] Check ages are calculated correctly
- [ ] Check gender is assigned (M/F)
- [ ] Check age categories are correct:
  - U10: < 10 years
  - U12: < 12 years
  - U16: < 16 years
  - U18: < 18 years
  - Senior: >= 18 years
- [ ] Check for missing birthdate warnings (should show 3 players)

### 1.3 Add New Player
- [ ] Click "Add New Player" button
- [ ] Fill in form:
  - Player Number: (leave empty for auto-generate)
  - First Name: "Test"
  - Last Name: "Player"
  - Birth Date: "01/01/2010"
  - Address: "Test City"
  - Meal: "Vegetarian"
  - Gender: "Male"
- [ ] Click "Add Player"
- [ ] Verify player #42 is added to list
- [ ] Verify age is calculated (should be 14)
- [ ] Verify category is "U16"

### 1.4 Edit Player
- [ ] Find "Test Player" in list
- [ ] Click "Edit" button
- [ ] Change birthdate to empty (to test missing birthdate)
- [ ] Click "Update Player"
- [ ] Verify warning appears for missing birthdate
- [ ] Edit again and add birthdate back: "15/05/2000"
- [ ] Verify age updates (should be 24)
- [ ] Verify category is "Senior"

### 1.5 Delete Player
- [ ] Find "Test Player" in list
- [ ] Click "Delete" button
- [ ] Confirm deletion dialog
- [ ] Verify player is removed from list
- [ ] Verify count is back to 41 players

---

## ✅ Phase 2: Tournament Start & Initial State

### 2.1 Navigate to Leaderboard
- [ ] Click "Leaderboard" in sidebar
- [ ] Verify all 41 players are listed
- [ ] Verify initial state for ALL players:
  - Bounty: 20₱
  - Wins: 0
  - Losses: 0
  - Draws: 0
  - Sheriff badge: ⭐ (has badge)
  - Criminal status: Normal (green)

### 2.2 Start Tournament
- [ ] Click "Start Tournament" button
- [ ] Verify button changes to "Generate Round 1 Pairings"
- [ ] Verify tournament status shows "Tournament Started"

---

## ✅ Phase 3: Round 1 - Pairing & Games

### 3.1 Generate Round 1
- [ ] Click "Generate Round 1 Pairings"
- [ ] Verify navigates to "Current Round" view
- [ ] Verify round header shows "Round 1"
- [ ] Verify 20 regular games + 1 BYE (41 players = odd number)
- [ ] Check BYE player gets automatic win (+1 Win, +0 Bounty)

### 3.2 Game Cards Verification
For each game card, verify it shows:
- [ ] Board number
- [ ] White player name, ID, bounty
- [ ] Black player name, ID, bounty
- [ ] Sheriff badge checkbox (if player has badge)
- [ ] Result buttons: White Wins / Black Wins / Draw
- [ ] Submit button disabled until result selected

### 3.3 Test Game Result #1: Normal Win (No Sheriff)
**Test Case: Player A (20₱) beats Player B (20₱), no sheriff used**
- [ ] Select a game where both players have 20₱
- [ ] Don't check any sheriff badge boxes
- [ ] Click "White Wins"
- [ ] Click "Submit Result"
- [ ] Verify game card shows "Completed"
- [ ] Verify White player: +1 Win, Bounty = 30₱ (gained 10₱)
- [ ] Verify Black player: +1 Loss, Bounty = 10₱ (lost 10₱)
- [ ] Verify both still have sheriff badge

### 3.4 Test Game Result #2: Win with Sheriff Badge Used
**Test Case: Player C (20₱) beats Player D (20₱), Player C uses sheriff**
- [ ] Select another game
- [ ] Check "Use Sheriff Badge" for WHITE player
- [ ] Click "White Wins"
- [ ] Click "Submit Result"
- [ ] Verify White player: Bounty = 32₱ (gained 12₱ = 10 base + 2 sheriff bonus)
- [ ] Verify White player: Sheriff badge REMOVED (⭐ → ❌)
- [ ] Verify Black player: Bounty = 10₱ (lost 10₱)
- [ ] Verify Black player: Still has sheriff badge

### 3.5 Test Game Result #3: Sheriff Steal
**Test Case: Player E (20₱) beats Player F (30₱), Player F used sheriff before**
- [ ] Find a game where black player lost before (has 10₱)
- [ ] White player beats black player
- [ ] White uses sheriff badge
- [ ] Verify White player becomes Criminal (⚔️)
- [ ] Verify steal calculation: gains 1.2x the bounty difference
- [ ] Example: If black has 10₱, white gains 10 base + 2 sheriff = 32₱ total

### 3.6 Test Game Result #4: Draw
**Test Case: Player G draws with Player H**
- [ ] Select a game
- [ ] Click "Draw"
- [ ] Click "Submit Result"
- [ ] Verify both players: +1 Draw
- [ ] Verify bounties unchanged (both still 20₱)
- [ ] Verify both keep sheriff badges

### 3.7 Test Game Result #5: U12 Protection
**Test Case: Adult beats U12 child**
- [ ] Find Lovenah Beharry (age 5, U10)
- [ ] Opponent wins
- [ ] Verify child ONLY loses 5₱ (protected amount)
- [ ] Verify child bounty = 15₱ (not 10₱)
- [ ] Verify winner gains only 5₱ (not 10₱)

### 3.8 Test Game Result #6: Criminal Redemption
**Test Case: Criminal loses**
- [ ] Find a player who is Criminal (⚔️)
- [ ] They lose a game
- [ ] Verify status changes to Normal (green)
- [ ] Verify normal bounty transfer rules apply

### 3.9 Complete All Round 1 Games
- [ ] Complete all 20 games
- [ ] Verify progress bar shows 100%
- [ ] Verify "Round 1 Complete" message appears
- [ ] Click "Back to Leaderboard"

---

## ✅ Phase 4: Leaderboard After Round 1

### 4.1 Verify Leaderboard Sorting
- [ ] Verify players sorted by bounty (highest first)
- [ ] Verify ties broken by wins
- [ ] Verify rank numbers are correct (1, 2, 3, etc.)

### 4.2 Verify Bounty Calculations
Check random samples:
- [ ] Winner with no sheriff: 20 + 10 = 30₱
- [ ] Winner with sheriff: 20 + 12 = 32₱
- [ ] Loser with no protection: 20 - 10 = 10₱
- [ ] U12 loser: 20 - 5 = 15₱
- [ ] Draw: 20 + 0 = 20₱

### 4.3 Verify Win/Loss/Draw Counts
- [ ] Check winners have +1 Win
- [ ] Check losers have +1 Loss
- [ ] Check draws have +1 Draw for both
- [ ] Check BYE player has +1 Win, +0 bounty change

### 4.4 Verify Criminal Status Display
- [ ] Check players with bounty > 30₱ and who stole are marked Criminal (⚔️)
- [ ] Check color coding is correct

---

## ✅ Phase 5: Round 2 - Pairing Algorithm

### 5.1 Generate Round 2
- [ ] Click "Generate Round 2 Pairings"
- [ ] Verify Swiss pairing: players paired by similar scores
- [ ] Verify no player faces same opponent twice
- [ ] Verify different player gets BYE (if 41 players)

### 5.2 Complete Some Round 2 Games
- [ ] Test different scenarios:
  - High bounty vs high bounty
  - Low bounty vs low bounty
  - Criminal vs normal
- [ ] Verify all calculations still correct

---

## ✅ Phase 6: Multi-Round Testing

### 6.1 Complete Multiple Rounds
- [ ] Complete rounds 2-5
- [ ] Verify pairing algorithm works correctly
- [ ] Verify bounty accumulation over rounds
- [ ] Verify statistics are cumulative

### 6.2 Edge Cases
- [ ] Test player with 0₱ bounty loses again (can't go negative)
- [ ] Test player with 60₱+ bounty (very high bounty)
- [ ] Test multiple draws in a row
- [ ] Test using sheriff badge in critical moments

---

## ✅ Phase 7: Prizes & Final Results

### 7.1 Navigate to Prizes
- [ ] Click "Prizes" in sidebar
- [ ] Verify "Greatest Criminal" is highest bounty player
- [ ] Verify "Most Dangerous Lady" is highest bounty female
- [ ] Verify age category winners are correct:
  - U12 Boy: highest bounty boy under 12
  - U12 Girl: highest bounty girl under 12
  - U16: highest bounty player under 16
  - U18: highest bounty player under 18

### 7.2 Special Categories
- [ ] Verify "Fastest Shooter" = most wins
- [ ] Verify "Most Draws" = most draws
- [ ] Verify "Untouchable" = least losses
- [ ] Verify "Perfect Balance" = closest to 20₱

---

## ✅ Phase 8: Data Management

### 8.1 Export Data
- [ ] Click "Export Data" in sidebar
- [ ] Verify JSON file downloads
- [ ] Open file and verify structure
- [ ] Check all players, rounds, games are included

### 8.2 Reset Tournament
- [ ] Click "Reset Tournament"
- [ ] Confirm reset
- [ ] Verify returns to import screen
- [ ] Verify all data cleared

### 8.3 Import Exported Data
- [ ] Click "Import Data" in sidebar
- [ ] Select previously exported JSON
- [ ] Verify tournament state restored exactly
- [ ] Verify all rounds, players, bounties match

---

## ✅ Phase 9: Real-Time Sync (Supabase)

### 9.1 Multi-Device Testing
- [ ] Open app in two browser windows/tabs
- [ ] Submit a game result in window 1
- [ ] Verify window 2 updates automatically
- [ ] Check "Syncing..." indicator appears

### 9.2 Offline Recovery
- [ ] Turn off network
- [ ] Try to submit results (should fail)
- [ ] Turn network back on
- [ ] Verify data syncs correctly

---

## ✅ Phase 10: Mobile Responsiveness

### 10.1 Mobile Layout
- [ ] Resize browser to mobile size (375px width)
- [ ] Verify sidebar collapses to hamburger menu
- [ ] Verify leaderboard switches to card view
- [ ] Verify game cards stack vertically
- [ ] Verify all buttons are tappable

### 10.2 Tablet Layout
- [ ] Resize to tablet size (768px width)
- [ ] Verify layout adjusts appropriately
- [ ] Verify tables remain readable

---

## ✅ Phase 11: Print Functionality

### 11.1 Print Pairings
- [ ] Go to Current Round view
- [ ] Click "Print Pairings"
- [ ] Verify print preview shows clean layout
- [ ] Verify no sidebar/navigation in print
- [ ] Verify board numbers, player names, IDs are clear

---

## 🎯 Critical Rule Verifications

### Bounty Rules (lib/bounty.ts)
- [x] Base transfer: 10₱
- [x] Sheriff bonus: +20% = 2₱ extra
- [x] Sheriff steal: 1.2x multiplier (updated from 1.5x)
- [x] U12 protection: max 5₱ loss (updated from U10)
- [x] Minimum bounty: 0₱ (can't go negative)
- [x] Criminal status: triggered by stealing
- [x] Criminal redemption: lose any game

### Pairing Rules (lib/pairing.ts)
- [ ] Swiss system: pair by similar scores
- [ ] No repeat opponents
- [ ] Alternating colors when possible
- [ ] BYE for odd numbers (rotates)
- [ ] BYE gives +1 Win, +0 Bounty

---

## 📊 Test Results Summary

**Date:** _____________
**Tester:** _____________
**Total Tests:** 100+
**Passed:** _____
**Failed:** _____
**Critical Issues:** _____

### Issues Found:
1. 
2. 
3. 

### Notes:


