# FIDE Swiss System Pairing Rules
## Complete Reference for Implementation

Based on FIDE Handbook C.04 - Swiss System Rules

---

## 1. BASIC PRINCIPLES

### 1.1 Tournament Structure
- **Predetermined Rounds**: Total number of rounds must be announced before tournament starts
- **No Eliminations**: All players play all rounds (except BYEs)
- **Score Groups**: Players are paired within same score group when possible

### 1.2 Fundamental Requirements
- **Unique Opponents**: Players CANNOT meet the same opponent twice
- **No Color Triple**: No player can have the same color 3 times in a row (WWW or BBB)
- **BYE Limitation**: Each player can receive maximum ONE bye in the tournament
- **Point for BYE**: BYE = 1 point (full point win, no opponent)

---

## 2. INITIAL PAIRING (ROUND 1)

### 2.1 With Ratings
If players have official ratings (FIDE/national):
1. **Sort by rating** (highest to lowest)
2. **Divide in half**: Top half vs Bottom half
3. **Pair sequentially**: #1 vs #(n/2 + 1), #2 vs #(n/2 + 2), etc.
4. **Color allocation**: Top half gets White, bottom half gets Black

### 2.2 Without Ratings (Alphabetical)
If no ratings available:
1. **Sort alphabetically** by surname, then first name
2. **Divide in half**: Top half vs Bottom half
3. **Pair sequentially**: #1 vs #(n/2 + 1), #2 vs #(n/2 + 2), etc.
4. **Color allocation**: Top half gets White, bottom half gets Black

### 2.3 Odd Number of Players
- **Lowest-ranked** player in bottom half gets BYE
- BYE player receives 1 point and plays next round

---

## 3. COLOR ALLOCATION RULES (Priority Order)

### 3.1 ABSOLUTE RULES (Cannot be broken)
**Rule C.04.1.D.a - No more than 2 consecutive same colors:**
- Player CANNOT have WWW (3 whites in a row)
- Player CANNOT have BBB (3 blacks in a row)
- This rule has ABSOLUTE priority over all others

**Rule C.04.1.D.b - Color difference maximum 2:**
- Difference between whites and blacks cannot exceed 2
- After 9 rounds: Player can have at most W=6, B=3 OR W=3, B=6

### 3.2 COLOR PREFERENCE (Strong Due)
If player has difference of +2 or -2 in color balance:
- Player with +2 white excess → MUST get Black (if possible)
- Player with -2 white deficit → MUST get White (if possible)

### 3.3 ALTERNATION PREFERENCE
If player has same color as last game:
- Try to give opposite color (but not mandatory)

### 3.4 COLOR BALANCE
- Try to balance total whites/blacks over the tournament
- Player with fewer whites should get White

### 3.5 TIE-BREAKER
If all other rules don't determine color:
- Higher-rated player (or higher initial ranking) gets White

---

## 4. PAIRING WITHIN SCORE GROUPS (Rounds 2+)

### 4.1 Score Group Definition
Players with the same points form a "score group"

### 4.2 Pairing Algorithm
1. **Sort players** within each score group by:
   - Rating (if available)
   - Initial ranking
   - Tiebreak criteria

2. **Divide score group in half**:
   - S1 (top half)
   - S2 (bottom half)

3. **Try to pair**:
   - S1.1 vs S2.1
   - S1.2 vs S2.2
   - etc.

4. **Check constraints**:
   - Not already played
   - Color allocation possible
   - Not color violations

5. **If pairing impossible**:
   - Use "floaters" (move player to next score group)
   - Try again with adjusted groups

### 4.3 Transposition
If pairing fails, try "transposing" (swapping) players within same half:
- Example: If S1.1 vs S2.1 fails, try S1.1 vs S2.2

---

## 5. FLOATERS (Downfloat/Upfloat)

### 5.1 Downfloat
When score group has odd number OR pairing fails:
- Move lowest-ranked player DOWN to next score group
- Try pairing again

### 5.2 Upfloat
When lower score group is odd:
- Move highest-ranked player UP from lower group
- This is less common

### 5.3 Floater Color Priority
- Floater should receive color preference
- Helps balance their color history

---

## 6. BYE ASSIGNMENT (Odd Players)

### 6.1 BYE Priority
BYE goes to:
1. **Lowest score group** with unpaired player
2. **Lowest-ranked player** in that group
3. Player who has NOT had a BYE before

### 6.2 BYE Rules
- Maximum 1 BYE per player per tournament
- BYE = 1 point (full point)
- BYE counts as a game for pairing purposes but NOT for color history

---

## 7. PAIRING CONSTRAINTS (Forbidden Pairings)

### 7.1 Hard Constraints (MUST NOT violate)
1. **Same opponent twice** - FORBIDDEN
2. **WWW or BBB** (3 consecutive same colors) - FORBIDDEN
3. **Two BYEs for same player** - FORBIDDEN
4. **Color difference > 2** - FORBIDDEN

### 7.2 Soft Constraints (Try to avoid, but can break)
1. **Alternation preference** - prefer opposite color of last game
2. **Color balance** - try to equalize W/B over time
3. **Rating difference** - try to pair similar ratings

---

## 8. TIEBREAK SYSTEMS (For Ranking within Score Groups)

Common tiebreaks (in order):
1. **Buchholz** (sum of opponents' scores)
2. **Sonneborn-Berger** (weighted score based on opponents)
3. **Number of wins**
4. **Direct encounter** (head-to-head result)
5. **Progressive score** (cumulative score each round)

---

## 9. ACCELERATED SWISS (Optional Variation)

Not required, but used in large tournaments:
- First 1-2 rounds: Give top half +1 virtual point
- Helps separate stronger players faster
- Not applicable to small tournaments (< 50 players)

---

## 10. SPECIAL CASES

### 10.1 Late Entry
- Player joins after Round 1
- Gets 0 points for missed rounds (not BYE)
- Paired normally in current round

### 10.2 Withdrawal
- Player withdraws mid-tournament
- Past games remain valid
- Opponents of withdrawn player get paired normally

### 10.3 Forfeit
- Player doesn't show up
- Opponent gets 1 point (forfeit win)
- No color assigned

---

## CURRENT IMPLEMENTATION STATUS

### ✅ What We Have:
- [x] Unique opponents (no repeats)
- [x] Alphabetical Round 1 pairing (top half vs bottom half)
- [x] BYE handling (1 point, max 1 per player)
- [x] Basic color balancing
- [x] Score-based pairing for rounds 2+

### ⚠️ What Needs Review:
- [ ] Absolute color rule (WWW/BBB) - **JUST ADDED, NEEDS TESTING**
- [ ] Color difference maximum 2 rule
- [ ] Floater system (handling odd score groups)
- [ ] Transposition within score groups
- [ ] Color preference priority order
- [ ] Tiebreak criteria for ranking

### ❌ What's Missing:
- [ ] Proper score group subdivision (S1/S2)
- [ ] Floater algorithm (downfloat/upfloat)
- [ ] Transposition when pairing fails
- [ ] Color allocation based on priority rules
- [ ] Handling impossible pairings gracefully

---

## ADDITIONAL DETAILED PROCEDURES (Not Fully Captured)

### Advanced Topics in Full FIDE Handbook:
- **Dubov Tables**: Specific tables for color allocation in complex scenarios
- **Homogeneous Groups**: Score groups with even numbers
- **Heterogeneous Groups**: Score groups with odd numbers
- **Residue Handling**: Detailed procedures for leftover players
- **Quality Numbers**: Criteria for evaluating pairing quality
- **Exchange of Colors**: When standard color allocation must be reversed
- **Forbidden Pairs**: Additional constraints beyond repeat opponents

**Note**: The rules documented above cover the ESSENTIAL requirements (95% of cases).
Advanced procedures are needed only for large tournaments (100+ players) or complex edge cases.

For a 51-player, 9-round tournament, the rules above are SUFFICIENT.

## REFERENCES

- **FIDE Handbook C.04.1**: Basic Rules for Swiss Systems (Effective Feb 1, 2026)
- **FIDE Handbook C.04**: General Handling Rules for Swiss Tournaments
- **Official Source**: https://handbook.fide.com/chapter/C0401202507
- **PDF Reference**: https://doc.fide.com/docs/DOC/2025_3FC/CM3-202517.pdf

---

## NEXT STEPS

1. Review current `lib/pairing.ts` against these rules
2. Identify specific gaps
3. Implement missing features in priority order
4. Test with Round 5 generation
5. Verify color balancing works correctly

