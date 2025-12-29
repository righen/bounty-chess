# FIDE Swiss System - Complete Official Rules (C.04)
## Dutch System - Baku 2016 Version
### Complete Implementation Reference

---

## TABLE OF CONTENTS
1. [Basic Rules](#basic-rules-c041)
2. [General Handling Rules](#general-handling-rules-c042)
3. [Definitions](#definitions-a)
4. [Pairing Process](#pairing-process-b)
5. [Pairing Criteria](#pairing-criteria-c)
6. [Sequential Generation Rules](#sequential-generation-d)
7. [Color Allocation Rules](#color-allocation-e)
8. [Baku Acceleration](#baku-acceleration-c0451)

---

## BASIC RULES (C.04.1)

### a. Number of Rounds
- **MUST** be declared before tournament starts
- **CANNOT** be changed after start (unless force majeure)

### b. No Repeat Opponents ⭐ ABSOLUTE
- Two players **SHALL NOT** play each other more than once
- **ONLY** principle that cannot be dispensed with
- Exception: If won by forfeit, players can meet again later

### c. Odd Number - BYE
- One player receives pairing-allocated bye (PAB)
- Receives: **No opponent, no color, same points as a win**
- Organizers can set different value (e.g., half point)

### d. One BYE Only ⭐ ABSOLUTE
- Player who received PAB **CANNOT** receive another
- Player who received forfeit win **CANNOT** receive PAB
- "Requested bye" does NOT prevent PAB later

### e. Pairing by Score ⭐ CORE PRINCIPLE
- Players paired with others having **same score**
- Higher priority than color preferences
- Cannot make players float for color preferences alone

### f. Color Difference Maximum ±2 ⭐ ABSOLUTE
- `(Whites - Blacks)` must be: **-2 ≤ CD ≤ +2**
- Exception possible for topscorers in last round only

### g. No Three Consecutive Same Colors ⭐ ABSOLUTE
- **NO WWW** (three whites in a row)
- **NO BBB** (three blacks in a row)
- Exception possible for topscorers in last round only

### h. Color Allocation Priority
1. **Fewer games**: Give color played fewer times
2. **Alternation**: If balanced, alternate from last game

### i. Transparency
- Rules must be **explainable** by arbiter
- Pairing process must be **reproducible**

---

## GENERAL HANDLING RULES (C.04.2)

### A. Pairing Systems

**A.1** - Use published FIDE Swiss Systems
**A.2** - Unpublished systems need QC approval
**A.3** - Declare system when reporting to FIDE
**A.4** - FIDE systems are **objective, impartial, reproducible**
**A.5** - **FORBIDDEN** to alter pairings to favor any player

### B. Initial Order

**B.2.1** - Player strength measure (rating)
**B.2.2** - Sort by:
1. Rating (highest first)
2. FIDE title (GM, IM, WGM, FM, WIM, CM, WFM, WCM)
3. Alphabetically (or announced alternative)

**B.2.3** - Pairing numbers assigned by ranking
- Can adjust for errors in **first 3 rounds only**
- After Round 4: pairing numbers **frozen**

### C. Late Entries

**C.3.1** - Late arrivals can be excluded unless written notice
**C.3.2.1** - Arrives in time for Round 1: normal pairing
**C.3.2.2** - Arrives later: gets 0 points for missed rounds, paired when arrives
**C.3.3** - Pairing numbers provisional until list closes

### D. Pairing, Color, and Publishing Rules

**D.4.1** - Adjourned games = draws for pairing only
**D.4.2** - Absent without notice = withdrawn
**D.4.3** - Withdrawn players no longer paired
**D.4.4** - Known absences: not paired, score 0
**D.4.5** - Only **played games** count for color sequence
- Example: `BWB=W` treated as `BWBW`
- Unplayed games "float" to top of history

**D.4.6** - Two players who didn't play can be paired again
**D.4.7** - Results published at announced time
**D.4.8** - Corrections possible within deadline
**D.4.9** - **Sort pairs before publishing** by:
1. Score of higher ranked player
2. Sum of both scores
3. Initial rank of higher ranked player

**D.4.10** - Published pairings **SHALL NOT** be changed
- Exception: If violates rule b (repeat opponent)

---

## DEFINITIONS (A)

### A.1 Initial Ranking List
See B.2 (sorted by rating, title, alphabetically)

### A.2 Order for Pairings
Players ranked by:
1. **Score** (points)
2. **Pairing number** (from initial ranking)

### A.3 Scoregroups and Brackets

**Scoregroup**: All players with same score
- Exception: Special Collapsed Scoregroup (SCS)

**Bracket**: Group to be paired
- = Scoregroup + downfloaters from previous bracket

**Homogeneous Bracket**: All same score
**Heterogeneous Bracket**: Different scores (has MDPs)

**Remainder**: Sub-bracket of heterogeneous bracket

### A.4 Floaters and Floats

**Downfloater**: Player who remains unpaired, moves to next bracket
**Moved-Down Player (MDP)**: Downfloater in destination bracket

**Upfloater**: Player paired with higher-scored opponent

**Float Tracking**:
- Player gets **downfloat** when paired with higher score
- Player gets **upfloat** when paired with lower score
- Unplayed round = downfloat

**Why Track Floats?**
- Minimize repetition of unequal pairings
- FIDE (Dutch) looks at last 2 rounds only

### A.5 Pairing-Allocated Bye (PAB)
- Assigned at end of last bracket pairing
- Not selected before pairing (unlike Dubov/Burstein)

### A.6 Color Differences and Preferences

**Color Difference (CD)**: `Whites - Blacks`

**Color Preferences (Priority)**:

1. **ABSOLUTE** (cannot ignore):
   - CD > +1 or CD < -1 → Preference to balance
   - Same color last 2 rounds → Opposite color
   - Examples:
     - CD = +2 or higher → **MUST get Black**
     - CD = -2 or lower → **MUST get White**
     - Last 2 = WW → **MUST get Black**
     - Last 2 = BB → **MUST get White**

2. **STRONG**:
   - CD = +1 → Prefer Black
   - CD = -1 → Prefer White

3. **MILD**:
   - CD = 0 → Prefer opposite of last game

4. **NONE**:
   - No games played yet

### A.7 Topscorers
Players with **> 50%** of maximum possible score in **final round**

Special treatment allowed:
- Can get 3 same colors in row (if needed)
- Can get CD > ±2 (if needed)
- Only for better opponent matching

### A.8 Pairing Score Difference (PSD)

**PSD** = List of Score Differences, sorted highest → lowest

**Score Difference (SD) for Pairs**:
- `SD = |Score₁ - Score₂|` (absolute value)

**Score Difference (SD) for Downfloaters**:
- `SD = FloaterScore - (MinBracketScore - 1)`
- Can be negative for last brackets
- Ensures PAB goes to lowest scorer

**Comparison**: Lexicographic (dictionary order)
- Compare first SD of each PSD
- If equal, compare second SD
- Continue until difference found
- Smaller PSD is better

**Example**:
- PSD₁ = [2.0, 1.5, 0.5]
- PSD₂ = [2.0, 1.0, 1.0]
- PSD₂ is better (1.0 < 1.5 at position 2)

### A.9 Round-Pairing Outlook

**Round-Pairing**: Complete when:
- All players paired (except ≤1 for PAB)
- Absolute criteria (C.1-C.3) satisfied

**Normal Process**:
1. Start with top scoregroup
2. Create bracket, pair it
3. Downfloaters → next bracket
4. Continue until all paired

**Special Process (Completion Test Failure)**:

When downfloaters + remaining players **cannot** be paired:

1. Define **Penultimate Pairing Bracket (PPB)**:
   - Last successfully paired bracket
   - Its score = "collapsing score"

2. Create **Special Collapsed Scoregroup (SCS)**:
   - All players with score < collapsing score
   - All are "residents" regardless of actual score

3. Re-pair **PPB**:
   - Goal: Produce floaters that allow CLB to pair

4. Create **Collapsed Last Bracket (CLB)**:
   - PPB floaters + SCS
   - Last bracket by definition
   - Paired with special rules

**Completion Test**:
- Before pairing bracket: verify remaining players CAN be paired
- If fails: trigger PPB/CLB process

---

## PAIRING PROCESS (B)

### B.1 Parameters

**M0** = Number of MDPs from previous bracket (may be 0)

**MaxPairs** = Maximum pairs possible in current bracket
- Usually `⌊Players/2⌋`
- But if M0 > residents, MaxPairs ≤ residents

**M1** = Maximum MDPs that can be paired
- Usually = M0
- But if M0 > residents, M1 ≤ residents
- M1 ≤ MaxPairs always

### B.2 Subgroups (Original Composition)

**S1** = Higher N1 players (sorted by A.2)
- N1 = M1 (if heterogeneous) OR MaxPairs (if homogeneous)

**S2** = Remaining resident players

**Limbo** = Excluded MDPs (if M1 < M0)
- M0 - M1 MDPs in Limbo
- Cannot be paired in bracket
- Bound to double-float

### B.3 Preparation of Candidate

**Pair players**: S1[i] with S2[i]
- First S1 player with first S2 player
- Second S1 with second S2, etc.

**Homogeneous Bracket**:
- Candidate = Pairs + Unpaired (floaters)

**Heterogeneous Bracket**:
- MDP-Pairing = M1 pairs (MDP + resident each)
- Remainder = Remaining residents (paired like homogeneous)
- Candidate = MDP-Pairing + Remainder-Pairs + Limbo + Unpaired

### B.4 Evaluation of Candidate

**Perfect Candidate**:
- Complies with absolute criteria (C.1-C.4)
- Satisfies all quality criteria (C.5-C.19)
- **Accepted immediately**

**Not Perfect**:
- Apply B.5 to find perfect candidate
- If none exists, apply B.8 (choose best available)

**After Pairing**:
- Perform **Completion Test**
- If fails → trigger PPB/CLB process (A.9)

### B.5 Actions When Not Perfect

**Alter subgroups** to produce different candidate

**Sequences**:
- Homogeneous/Remainders: B.6
- Heterogeneous: B.7

**After each alteration**:
- Build new candidate (B.3)
- Evaluate (B.4)

**Iterative Process**:
- Try alterations one by one
- First perfect candidate = accepted
- Track "provisional-best" for non-perfect case

**Comparison Criteria** (priority order):
1. Priority of highest infringed criterion
2. Failure value of that criterion
3. Next highest infringed criterion
4. Continue until difference found
5. If tied: first generated candidate wins

**Principle**: Minimum disturbance

### B.6 Alterations - Homogeneous/Remainders

**Sequence**:
1. **Transposition** of S2 (D.1)
   - Try all transpositions for current S1
2. If exhausted: **Exchange** S1 ↔ S2 (D.2)
   - Swap players between subgroups
   - Reorder both S1 and S2 by A.2
   - Try all transpositions for new S1
3. If exhausted: Next exchange
4. Continue until success or all exhausted

**Note**: Pair with player from S1 having lower rank than S2 opponent = already evaluated, skip

### B.7 Alterations - Heterogeneous

**Sequence for Remainder**:
1. Apply B.6 rules to remainder (using S1R, S2R)

**If remainder exhausted**:
2. **Transposition** of original S2
   - Creates new MDP-Pairing
   - New remainder → process with B.6
   - Only try transpositions that change first part of S2 (MDP opponents)

**If transpositions exhausted AND Limbo exists**:
3. **MDP-Exchange**: S1 ↔ Limbo (D.3)
   - Swap MDPs between S1 and Limbo
   - Reorder S1, restore S2 to original
   - Try all transpositions again

**Special: PPB and CLB**:
- PPB: Choose floaters to allow CLB completion (C.4), not optimize
- CLB: Minimize PSD including remainder pairs
  - Apply float repetition criteria (C.12-C.15)
  - Apply score difference criteria (C.16-C.19) for heterogeneous pairs

### B.8 Choose Best Available

When no perfect candidate exists:
- Choose best from all evaluated
- Compare by quality criteria (C.5-C.19) priority
- If tied: first generated wins

**Sieve Pairing (Theoretical Alternative)**:
1. Generate all legal pairings
2. Apply criteria one by one (most important first)
3. Discard violators
4. Continue until one remains (or choose first if multiple)

---

## PAIRING CRITERIA (C)

### ABSOLUTE CRITERIA

**C.1** - No Repeat Opponents (C.04.1.b)
- Exception: Forfeit wins don't count as "met"

**C.2** - One PAB Only (C.04.1.d)
- No PAB if already had PAB or forfeit win
- Requested bye OK

**C.3** - Absolute Color Preferences
- Non-topscorers with same absolute preference **SHALL NOT** meet
- Exceptions: Topscorers and topscorer opponents

**Incompatible Players**:
- Violate C.1 or C.3

### COMPLETION CRITERION

**C.4** - PPB Downfloater Choice
- Choose floaters to **complete round-pairing**
- Not to optimize next bracket
- Applies only to PPB

### QUALITY CRITERIA (Descending Priority)

**C.5** - **Maximize Pairs** (minimize floaters)
- Most important quality criterion
- Build MaxPairs pairs
- Pair M1 MDPs (heterogeneous)

**C.6** - **Minimize PSD**
- Pair highest-scored MDPs
- Minimize score mismatches
- Compare lexicographically

**C.7** - **Optimize Next Bracket**
- Choose floaters for next bracket's benefit
- Maximize pairs in next bracket
- Minimize PSD in next bracket
- **Look ahead only 1 bracket**
- NOT for PPB or CLB

**C.8** - **Minimize Topscorer CD > ±2**
- Topscorers or opponents with CD > +2 or < -2

**C.9** - **Minimize Topscorer 3-in-row**
- Topscorers or opponents with WWW or BBB

**C.10** - **Minimize Disregarded Preferences**
- Minimize players not getting color preference
- Theoretical minimum: `x = max(0, MaxPairs - n - a)`
  - n = minority color preferences
  - a = players with no preference

**C.11** - **Minimize Disregarded STRONG Preferences**
- Part of x should have mild preferences
- Remainder has strong preferences
- Minimize strong disregards

**C.12** - **Minimize Same Downfloat (Previous Round)**
- Avoid repeating downfloat from last round

**C.13** - **Minimize Same Upfloat (Previous Round)**
- Avoid repeating upfloat from last round

**C.14** - **Minimize Same Downfloat (2 Rounds Ago)**
- Avoid repeating downfloat from 2 rounds ago

**C.15** - **Minimize Same Upfloat (2 Rounds Ago)**
- Avoid repeating upfloat from 2 rounds ago

**C.16** - **Minimize SD for Protected Downfloaters (Previous)**
- Protected players who must float: minimize their SD

**C.17** - **Minimize SD for Protected Upfloaters (Previous)**

**C.18** - **Minimize SD for Protected Downfloaters (2 Ago)**

**C.19** - **Minimize SD for Protected Upfloaters (2 Ago)**

---

## SEQUENTIAL GENERATION (D)

### D.1 Transpositions in S2

**Transposition**: Change order of BSNs in S2

**BSN (Bracket Sequence Number)**:
- Tag each player: 1, 2, 3, 4, ...
- Represents ranking in bracket

**Sorting**: Lexicographic on first N1 BSNs
- N1 = size of S1
- Remaining S2 players ignored (bound to float or in remainder)

**Example**: S1=[1], S2=[2,3,4]
- Transpositions: [2]{3,4}, [3]{2,4}, [4]{2,3}
- Only first element matters (looking for 1 mate)

### D.2 Exchanges - Homogeneous/Remainders

**Exchange**: Swap equal-sized groups S1 ↔ S2

**Priority** (descending):

**a. Smallest number exchanged**
- Swap 1 player > swap 2 players

**b. Smallest sum difference**
- `min(|Σ(S2→S1 BSNs) - Σ(S1→S2 BSNs)|)`
- Example: swap 6↔4 better than 8↔5

**c. Highest BSN moved S1→S2**
- Move lower-ranked S1 player
- Example: move 5 better than move 4

**d. Lowest BSN moved S2→S1**
- Move higher-ranked S2 player
- Example: move 6 better than move 7

### D.3 Exchanges - Heterogeneous (MDP-Exchanges)

**MDP-Exchange**: Swap equal-sized groups S1 ↔ Limbo

**Evaluate NEW S1 after exchange**:

**Priority** (descending):

**a. Highest different score**
- Higher scored MDP in S1 better
- Complies with C.6 (minimize PSD)

**b. Lowest lexicographic BSN**
- Lower ranked MDPs in S1 better
- BSNs sorted ascending, compare lexicographically

**Application**:
- Pick next element in sorting order
- Iterate until success or exhausted

---

## COLOR ALLOCATION (E)

### Initial-Color
Determined by **drawing lots** before Round 1

### For Each Pair (Descending Priority):

**E.1** - **Grant BOTH Preferences**
- If possible, satisfy both players

**E.2** - **Grant STRONGER Preference**
- Strong > Mild
- Absolute > Strong
- If both absolute (topscorers): grant wider CD

**E.3** - **Alternate from Most Recent Common Color**
- Look at history, accounting for skipped games (C.04.2:D.5)
- Find most recent round where one had W and other had B
- Alternate from that

**E.4** - **Grant Higher Ranked Player's Preference**
- NOT always White!
- Higher ranked gets THEIR preference

**E.5** - **Use Initial-Color with Pairing Number**
- Both have no preference
- Odd pairing number → initial-color
- Even pairing number → opposite initial-color

---

## BAKU ACCELERATION (C.04.5.1)

### 1. Premise
Standard scoring only (1 win, 0.5 draw)

### 2. Initial Groups
**Before Round 1**: Split list in two

**GA (Group A)**:
- First half of players
- Rounded up to nearest EVEN number
- Formula: `2 × ⌈Players/4⌉`

**GB (Group B)**:
- All remaining players

**Example**: 161 players
- GA = first 82 players
- GB = remaining 79 players

### 3. Late Entries
After Round 1:
- Insert by rating/ranking
- Last GA-player stays same
- GA may become odd

### 4. Virtual Points
**Rounds 1-3**: GA players get **+1.0** virtual points
**Rounds 4-5**: GA players get **+0.5** virtual points
**Round 6+**: **No** virtual points

**GB players**: Never get virtual points

### 5. Pairing Score
`Pairing Score = Real Score + Virtual Points`

Use pairing score to:
- Define scoregroups
- Sort within scoregroups

---

## IMPLEMENTATION CHECKLIST

### ✅ Currently Have
- [x] Basic rules (a-i)
- [x] No repeat opponents
- [x] Color difference tracking
- [x] No WWW/BBB (just added)
- [x] Round 1 alphabetical pairing
- [x] Score-based pairing rounds 2+
- [x] BYE handling

### ⚠️ Partially Implemented
- [ ] Color preference priorities (absolute/strong/mild)
- [ ] Float tracking (downfloat/upfloat)
- [ ] PSD calculation and comparison
- [ ] Topscorer special handling

### ❌ Missing
- [ ] S1/S2 subgroup division
- [ ] Transposition algorithm (D.1)
- [ ] Exchange algorithm (D.2, D.3)
- [ ] MDP-Pairing for heterogeneous brackets
- [ ] Remainder pairing
- [ ] Limbo handling
- [ ] Completion test
- [ ] PPB/CLB process
- [ ] Quality criteria C.5-C.19 enforcement
- [ ] Look-ahead optimization (C.7)
- [ ] Iterative candidate evaluation
- [ ] BSN (Bracket Sequence Number) system

---

## COMPLEXITY ASSESSMENT

### For 51-Player Tournament:

**Essential (MUST HAVE)**:
- ✅ Basic rules (a-i)
- ✅ No repeat opponents
- ✅ Absolute color preferences
- ✅ Round 1 top-half vs bottom-half
- ⚠️ S1/S2 division + basic transpositions
- ⚠️ PSD calculation

**Important (SHOULD HAVE)**:
- Float tracking (C.12-C.15)
- Look-ahead (C.7)
- Color preference priorities (C.10-C.11)

**Advanced (NICE TO HAVE)**:
- Full transposition/exchange sequences
- PPB/CLB handling
- MDP-exchanges
- Quality criteria C.16-C.19

**NOT NEEDED**:
- Baku Acceleration (no ratings)
- Sieve pairing (theoretical)
- Remainder subdivisions (bracket too small)

---

## NEXT STEPS

1. ✅ Document all rules (DONE)
2. 📊 Analyze current implementation gaps
3. 🎯 Prioritize features by impact
4. 🔧 Implement core missing features
5. ✅ Test with Round 5 generation
6. 🔍 Verify FIDE compliance

---

**References**:
- FIDE Handbook C.04
- Baku 2016 Version
- Dutch Swiss System

