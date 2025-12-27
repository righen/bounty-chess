# 🎯 FINAL TOURNAMENT RULES - DECEMBER 27, 2025

**Status:** ✅ **DEPLOYED AND LIVE**  
**Live URL:** https://bounty-lilac-delta.vercel.app

---

## ✅ **CONFIRMED RULES IMPLEMENTED**

### **Basic Setup**
- ✅ 9 rounds total
- ✅ Each player starts with 20₱ bounty
- ✅ Each player starts with 1 sheriff badge

---

### **Bounty Transfer Rules**

#### **Base Rule:**
- Winner steals **50%** (half) of loser's bounty
- **Rounded down** to whole number (e.g., 6.67₱ → 6₱)

#### **Special Protections (FIRST 5 ROUNDS ONLY):**
| Player Type | Normal Loss | Protected Loss | Rounds |
|-------------|-------------|----------------|---------|
| **U12 (under 12)** | 50% | **25% (1/4)** | 1-5 only |
| **U16 (under 16)** | 50% | **33% (1/3)** | 1-5 only |
| **Women** | 50% | **33% (1/3)** | 1-5 only |
| **After Round 5** | 50% | 50% | 6-9 |

#### **Special Case:**
- If player has **≤ 2₱** bounty → Loses **EVERYTHING** on loss

#### **Draws:**
- No bounty transfer at all

---

### **Sheriff Protection Badge**

#### **One-Time Use Only:**
- ✅ Declare BEFORE game starts
- ✅ Place badge near clock

#### **Effects:**

| Scenario | Effect | Badge Consumed |
|----------|--------|----------------|
| **Winner uses** | Steal **1.2x** normal amount | ✅ Yes |
| **Loser uses** | Lose **0** bounty | ✅ Yes |
| **Both use** | Badges cancel, normal game | ✅ Both |
| **After Round 9** | Badge worthless | N/A |

#### **Criminal Status Interaction:**
- ✅ **Mad criminals are IMMUNE** to opponent's sheriff protection
  - Opponent's sheriff has NO effect on Mad criminal
  - But sheriff is still consumed

---

### **Criminal Status System**

#### **Evolution:**
- **Normal** → (1 sheriff against) → **Angry** → (2+ sheriffs against) → **Mad**

#### **Status Table:**

| Status | What Happened | Effect |
|--------|---------------|--------|
| 🟢 **Normal** | No sheriffs used against them | None |
| 🟠 **Angry** | 1 sheriff used against them | None yet |
| 🔴 **Mad** | 2+ sheriffs used against them | **IMMUNE to opponent's sheriff** |

---

### **Pairing System**

#### **Modified Swiss:**
- Pairs by **bounty amount** (not chess points)
- Highest bounties play each other
- **No repeat opponents** (can't play same person twice)

#### **BYE (odd number of players):**
- Lowest bounty player gets BYE
- Automatic +1 win
- **+0 bounty** (no bounty gain)

---

## 📊 **CALCULATION EXAMPLES**

### **Example 1: Normal Game (No Sheriff)**
- Loser has 20₱ bounty
- Round 6 (no protection)
- **Result:** Winner steals 10₱ (50% of 20)

### **Example 2: U12 Player Protected (Round 3)**
- Loser is 11 years old, has 20₱ bounty
- Round 3 (protection active)
- **Result:** Winner steals 5₱ (25% of 20)

### **Example 3: Winner Uses Sheriff**
- Loser has 20₱ bounty
- Winner uses sheriff badge
- Normal steal would be 10₱
- **Result:** Winner steals 12₱ (10 × 1.2)

### **Example 4: Both Use Sheriff**
- Both players use badges
- Badges cancel each other
- **Result:** Normal game (50% transfer), both badges consumed

### **Example 5: Low Bounty Rule**
- Loser has 2₱ bounty
- **Result:** Winner steals 2₱ (everything)

### **Example 6: Mad Criminal Immunity**
- Winner is Mad criminal
- Loser uses sheriff badge to protect
- **Result:** Sheriff doesn't work! Normal game, sheriff consumed

---

## 🏆 **PRIZE CATEGORIES**

### **Prizes Awarded:**
1. 🥇 **Trophy Winners** - Top 2 overall (by bounty)
2. 🥉 **Bronze Medals** - 3rd, 4th, 5th place
3. 👩 **Most Dangerous Lady** - Highest bounty woman
4. 🧒 **Age Category Gold Medals**:
   - U12 Boy (best boy under 12)
   - U12 Girl (best girl under 12)
   - U16 Champion (best under 16)
   - U18 Champion (best under 18)
5. 🎖️ **Participation Pins** - All players

---

## ⚠️ **IMPORTANT NOTES FOR ARBITERS**

### **Before Recording Results:**
1. ✅ Ask BOTH players: "Did anyone use sheriff badge?"
2. ✅ Check leaderboard to verify badge still available
3. ✅ Check boxes BEFORE clicking result button
4. ✅ Read result out loud: "Confirming: White wins, no badges"
5. ✅ Click appropriate button
6. ✅ Confirm on dialog

### **After Each Round:**
1. ✅ Export tournament data (backup!)
2. ✅ Save with round number: `round1-backup.json`
3. ✅ Verify all games completed (progress bar = 100%)

### **Safety:**
- Keep paper backup of results
- Export after EVERY round
- Don't close browser tab
- Keep laptop charged

---

## 🔢 **QUICK REFERENCE MULTIPLIERS**

| Situation | Multiplier | Example (20₱ loss) |
|-----------|------------|---------------------|
| Normal adult (R6-9) | 50% | 10₱ |
| U12 (R1-5) | 25% | 5₱ |
| U16/Women (R1-5) | 33% | 6₱ (6.67 rounded down) |
| Sheriff boost | ×1.2 | 12₱ (10 × 1.2) |
| Sheriff protection | ×0 | 0₱ |
| Both sheriffs | 50% | 10₱ (badges cancel) |
| Bounty ≤ 2 | 100% | Everything |

---

## 📱 **LIVE DEPLOYMENT**

**Main URL:** https://bounty-lilac-delta.vercel.app

**Features Available:**
- ✅ Import players (CSV or manual)
- ✅ Manage players (add/edit/delete)
- ✅ Start tournament
- ✅ Generate pairings
- ✅ Record results with sheriff tracking
- ✅ Live leaderboard
- ✅ Printable pairings
- ✅ Prize calculation
- ✅ Export backups
- ✅ Auto-save (localStorage)

---

## 🎯 **EVERYTHING IS READY FOR TOMORROW!**

✅ Rules implemented correctly  
✅ Deployed to Vercel  
✅ GitHub repository backed up  
✅ Documentation complete  
✅ Supabase ready for future upgrades

**Good luck with the tournament! 🏆♟️**

