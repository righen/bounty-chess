# 📘 Tournament Manager User Guide
## For Non-Technical Users

This guide will walk you through running the entire Bounty Chess Tournament. **No technical knowledge required!**

---

## 🚀 **Getting Started**

### Step 1: Open the Website
1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Go to: `http://localhost:3000`
3. You'll see the import screen

### Step 2: Import Players
**Option A: Use Sample Data (for testing)**
1. Click the green **"Load Sample Data"** button
2. Click **"Import Players & Start Tournament"**

**Option B: Upload Your CSV File**
1. Click **"Choose File"**
2. Select your player list CSV file
3. Click **"Import Players & Start Tournament"**

**Option C: Paste CSV Data**
1. Copy player data from Excel/Google Sheets
2. Paste into the text box
3. Click **"Import Players & Start Tournament"**

---

## 👥 **Managing Players (Before Tournament Starts)**

### Viewing Players
- After import, you're automatically on the **"👥 Manage Players"** page
- You can see all players with their:
  - ID number
  - Name
  - Age and Category (U10, U12, U16, U18, Adult)
  - Gender
  - Address and Meal preference

### Adding a Last-Minute Player
1. Click **"+ Add New Player"** (blue button, top right)
2. Fill in the form:
   - **First Name*** (required)
   - **Last Name*** (required)
   - **Birth Date** (DD/MM/YYYY format, optional)
   - **Gender*** (Male/Female, required)
   - Address, Meal (optional)
3. Click **"Add Player"**
4. Player will appear in the list with an auto-generated ID

### Editing a Player
1. Find the player in the list
2. Click the blue **"Edit"** button
3. Make changes
4. Click **"Update Player"**

### Deleting a Player
1. Find the player in the list
2. Click the red **"Delete"** button
3. Confirm deletion

⚠️ **Note:** You can only edit/delete players **before** the tournament starts!

---

## 🏁 **Starting the Tournament**

### Step 1: Review Your Players
1. Go to **"🏆 Leaderboard"** tab (top navigation)
2. Check that all players are listed
3. Verify the player count is correct

### Step 2: Start Tournament
1. Click the blue **"🚀 Start Tournament"** button (top right)
2. Status changes from "Not Started Yet" to "Tournament Started"
3. The button now shows **"Generate Round 1 Pairing"**

### Step 3: Generate First Round
1. Click **"Generate Round 1 Pairing"**
2. You'll be taken to the **"♟️ Current Round"** page
3. Pairings are automatically generated

---

## ♟️ **Running Each Round**

### Understanding the Round Page

**Top Section:**
- Round number (e.g., "Round 1")
- Progress bar showing completed games
- **"Back to Leaderboard"** button

**BYE Notice (if applicable):**
- Blue box showing which player has a bye
- They automatically get +1 win, no bounty gain

**Game Cards:**
- Each card shows one game
- White player on left, Black player on right
- Sheriff badge checkboxes
- Result buttons

**Bottom Section:**
- Printable pairings table with:
  - Board numbers
  - White and Black players
  - Player IDs and bounties
- **"🖨️ Print Pairings"** button

### Recording Game Results

**For Each Game:**

1. **If a player uses Sheriff Badge:**
   - Check the box **"Use Sheriff Badge 🛡️"**
   - This must be done BEFORE recording the result
   - Badge can only be used once per tournament

2. **Record the Result:**
   - Click **"White Wins"** if white player wins
   - Click **"Draw"** if game is drawn
   - Click **"Black Wins"** if black player wins

3. **What Happens:**
   - Bounties automatically update
   - Criminal status changes (if applicable)
   - Sheriff badges removed if used
   - Win/Loss/Draw records updated
   - Game card turns green and shows "✓ Result Recorded"

### When All Games Are Completed
- Green banner appears: "✓ Round X Complete!"
- Click **"Back to Leaderboard"**
- Generate the next round

---

## 📊 **Leaderboard & Stats**

### Leaderboard View
Shows all players sorted by bounty (highest first):
- **Rank** - Current standing
- **ID** - Player number
- **Name** - Full name and address
- **Age** - With category badge (U10, U12, etc.)
- **Gender** - Male/Female
- **Bounty** - Current bounty amount (₱)
- **Record** - Wins-Losses-Draws
- **Sheriff Badge** - 🛡️ if still available
- **Status** - normal, angry, or mad

### Statistics Panel (right side)
- Total Players
- Rounds Completed
- Rounds Remaining
- Active Sheriff Badges

---

## 🎖️ **Viewing Prizes**

### Check Prize Winners Anytime
1. Click **"🎖️ Prizes"** tab
2. See current prize winners based on standings:
   - 🥇 Trophy Winners (Top 2)
   - 🥉 Bronze Medals (3rd, 4th, 5th)
   - 🏆 Special Categories (Most Dangerous Lady, etc.)
   - 🥇 Age Category Gold Medals (U12 Boy/Girl, U16, U18)
   - 🎖️ Participation Pins (all players)

During the tournament, it shows **"Preview"**
After Round 9, it shows **"Final Results"**

---

## 🖨️ **Printing Pairings**

### For Each Round:
1. Go to **"♟️ Current Round"** tab
2. Scroll to bottom (Printable Pairings section)
3. Click **"🖨️ Print Pairings"**
4. Your browser's print dialog will open
5. Select printer or "Save as PDF"
6. Click Print

### What Gets Printed:
- Round number and game count
- Table with Board, White Player, Black Player
- Player names, IDs, and bounties
- BYE players (if any)

💡 **Tip:** Print pairings and post them on the wall so players can find their boards!

---

## 💾 **Saving & Exporting**

### Automatic Saving
- **Everything saves automatically!**
- Data is stored in your browser
- If you close the page, your data is safe
- Just reopen the page to continue

### Manual Export
1. Click **"Export Data"** button (top right, green)
2. A JSON file downloads to your computer
3. Keep this as a backup!
4. Contains all players, rounds, and results

### Resetting Tournament
⚠️ **WARNING:** This deletes ALL data!
1. Click **"Reset Tournament"** button (top right, red)
2. Confirm you want to reset
3. Starts fresh with import screen

---

## 🎯 **Tournament Rules Quick Reference**

### Bounty Transfer Rules
- **Normal win**: Steal half opponent's bounty
- **With Sheriff Badge**: Steal 1.5× opponent's bounty (no loss if you lose)
- **Women/U16 losing**: Lose only 1/3 of bounty
- **U10 losing**: Lose only 1/4 of bounty
- **Draw**: No bounty transfer

### Sheriff Badge
- Every player starts with ONE badge
- Can be used ONCE per tournament
- Check the box BEFORE recording result
- Protects from loss (even if you lose)
- Multiplies steal by 1.5× (if you win)
- Badge expires after Round 9

### Criminal Status
- **Normal** (green) - Default
- **Angry** (yellow) - After 1 sheriff badge used against you
- **Mad** (red) - After 2 sheriff badges used against you

### BYE
- Happens with odd number of players
- Player gets automatic win (+1 to record)
- No bounty gained or lost
- Clearly marked in blue box

---

## ❌ **Troubleshooting**

### "I accidentally recorded wrong result"
- ❌ Cannot undo game results
- Solution: Keep manual records as backup
- Prevention: Double-check before clicking result button

### "Page won't load / looks broken"
1. Refresh the page (F5 or Ctrl+R)
2. Check your internet connection
3. Try closing and reopening the browser

### "Data disappeared"
- Data is saved in browser storage
- If using a different browser, data won't transfer
- Solution: Use same browser throughout tournament
- Always export data after each round!

### "Can't print pairings"
1. Make sure printer is connected
2. Try "Save as PDF" instead
3. Check printer settings

### "Player has wrong information"
- Before tournament starts: Use Edit button
- After tournament starts: Cannot edit
- Prevention: Review all player data before starting

---

## ⏱️ **Tournament Flow Timeline**

### Before Tournament Day
- [ ] Test the software with sample data
- [ ] Prepare player CSV file
- [ ] Print this guide

### Tournament Day - Setup (15 mins)
- [ ] Open website
- [ ] Import all players
- [ ] Add any last-minute registrations
- [ ] Review player list on Manage Players tab
- [ ] Check Leaderboard to verify all players

### Tournament Day - Start (2 mins)
- [ ] Click "Start Tournament"
- [ ] Click "Generate Round 1 Pairing"
- [ ] Print pairings and post on wall

### During Each Round (20-40 mins per round)
- [ ] Players find their boards using printed pairings
- [ ] Games are played
- [ ] Arbiters record results as games finish
- [ ] When all games done, click "Back to Leaderboard"
- [ ] Click "Generate Round X Pairing" for next round

### After Each Round (3 mins)
- [ ] Export data (backup!)
- [ ] Print next round pairings
- [ ] Post on wall
- [ ] Announce round start

### After Round 9 - Final (10 mins)
- [ ] Go to Prizes tab
- [ ] See final winners
- [ ] Export final data
- [ ] Award prizes!

---

## 📞 **Quick Help**

**Everything is auto-saved!** Don't worry about losing data.

**Can't find something?**
- Use the navigation tabs at the top
- 👥 Manage Players - Add/edit players
- 🏆 Leaderboard - View standings
- ♟️ Current Round - Record results
- 🎖️ Prizes - See winners

**Need to print pairings?**
- Go to Current Round tab
- Scroll to bottom
- Click green Print button

**Made a mistake?**
- Game results cannot be undone
- Keep manual records as backup
- Export data after each round

---

## ✅ **Checklist for Non-Technical Arbiters**

Print this and keep it handy!

- [ ] I know how to import players
- [ ] I know how to add a last-minute player
- [ ] I know how to start the tournament
- [ ] I know how to generate round pairings
- [ ] I know how to print pairings
- [ ] I know how to record game results
- [ ] I know how to check sheriff badge boxes
- [ ] I know how to see the leaderboard
- [ ] I know how to export data
- [ ] I have exported data after Round 1 (backup!)
- [ ] I know where to view prize winners

---

## 🎉 **You're Ready!**

The software is designed to be simple and intuitive. If you can:
1. Click buttons
2. Check boxes
3. Read player names

**You can run this tournament!**

Good luck and have a great tournament! ♟️🏆
