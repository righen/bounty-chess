# 🎯 Arbiter Quick Reference Guide

## Before the Tournament

1. **Import Players**: Use "Load Sample Data" button or paste CSV
2. **Verify Player Count**: Check that all players are imported correctly
3. **Export Backup**: Click "Export Data" and save the JSON file
4. **Start Round 1**: Click the green "Start Round 1" button

## During Each Round

### Starting a Round
1. Click "Start Round X" button
2. Click "Print" to get physical pairings
3. Distribute pairing sheets to players
4. Monitor games

### Entering Game Results

For each completed game:

#### Step 1: Check Sheriff Badge Usage
- Ask players if they used their sheriff badge
- ✅ Check the box if they used it
- ⚠️ Only works if they STILL HAVE their badge

#### Step 2: Click Result Button
- **Green**: White Wins
- **Gray**: Draw
- **Blue**: Black Wins

#### Step 3: Confirm
- Click OK on the confirmation dialog
- Game card turns green ✓

### What the App Calculates Automatically

✅ **Bounty transfer** (based on all rules)  
✅ **Age protections** (U10, U16)  
✅ **Women protections**  
✅ **Sheriff badge effects** (1.5x or 0)  
✅ **Criminal status updates**  
✅ **Win/loss records**  
✅ **Leaderboard rankings**

## Between Rounds

1. **Check Progress**: All games completed? ✓
2. **Back to Leaderboard**: Click the blue button
3. **Export Data**: IMPORTANT - Save after each round!
4. **Review Rankings**: Check top criminals
5. **Start Next Round**: Click "Start Round X+1"
6. Repeat for 9 rounds total

## Special Cases

### Sheriff Badge Rules
- ✅ **Both use**: Badges cancel, normal game
- ✅ **Winner uses**: Steals 1.5x bounty, opponent becomes Angry/Mad
- ✅ **Loser uses**: No bounty lost, winner becomes Angry/Mad
- ❌ **After Round 9**: Badges don't work anymore

### Criminal Status
- 🟢 **Normal**: Regular player
- 🟠 **Angry**: 1 sheriff used against them
- 🔴 **Mad**: 2+ sheriffs used, immune to opponent's sheriff

### Protection Rules (Rounds 1-7 ONLY)
- 🔵 **U10** (Blue): Lose 1/4 of bounty instead of 1/2
- 🟢 **U16** (Green): Lose 1/3 of bounty instead of 1/2
- 🌸 **Women** (Pink): Lose 1/3 of bounty instead of 1/2

### Low Bounty
- If player has **≤ 2₱**: They lose EVERYTHING on a loss

## Common Questions

### Q: What if I enter a result wrong?
**A**: There's no undo! Export data before each round to have backups.

### Q: How do I know if sheriff badges cancel out?
**A**: If both checkboxes are checked when you click the result.

### Q: When do protections stop working?
**A**: After Round 7, everyone loses 1/2 bounty (except if using sheriff).

### Q: What if a player forgets to declare their sheriff badge?
**A**: Sheriff badge must be declared BEFORE the result is entered. No changes after clicking the button!

### Q: Can a player lose more bounty than they have?
**A**: No, the app prevents this. Minimum bounty is 0.

## Troubleshooting

### Game Result Not Saving
- Check browser console (F12)
- Try refreshing page
- Restore from last export if needed

### Wrong Player Age/Gender
- Can't edit after import
- Start over with corrected CSV

### Sheriff Badge Not Working
- Check if player already used it (no shield icon)
- Check if Round > 9 (badges expire)

## Emergency Procedures

### Power Loss / Browser Crash
1. Reopen browser
2. Go to http://localhost:3000
3. Data should auto-restore from localStorage
4. If not, import last exported JSON

### Starting Over
1. Click "Reset Tournament" (⚠️ WARNING: Cannot undo!)
2. Re-import players
3. Start fresh

## Tips for Smooth Operation

✅ **Test first**: Run a practice round before the event  
✅ **Export often**: After EVERY round  
✅ **Large screen**: Easier to see multiple games  
✅ **Quiet environment**: For concentration  
✅ **Internet**: Not needed after first load  
✅ **Power backup**: Keep laptop charged  

## Keyboard Shortcuts

- **Print**: Ctrl/Cmd + P (when on printable pairings)
- **Refresh**: F5 (data persists)
- **Console**: F12 (for debugging)

## End of Tournament

1. **Complete Round 9**
2. **Back to Leaderboard**
3. **Export Final Data** (IMPORTANT!)
4. **Announce Winners**: Top criminals by bounty
5. **Award Prizes**: According to bounty amounts

## Contact Info

- Check README.md for detailed documentation
- Browser console (F12) shows error messages

---

**Remember**: The app handles ALL the complex calculations. Your job is to:
1. Enter results accurately
2. Check sheriff badge usage
3. Export data regularly

**Good luck! 🎲**

