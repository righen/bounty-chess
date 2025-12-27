# 🎯 Bounty Chess Tournament Manager

A complete web-based tournament management system for the unique "Bounty Chess" format where players compete with bounties, sheriff badges, and evolving criminal statuses!

**🌐 Live Demo:** [Deploy on Vercel →](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bounty-chess)

---

## ✨ Features

- 🏆 **Real-time Leaderboard** with bounty tracking
- ♟️ **Modified Swiss Pairing System** (pairs by bounty, not points)
- 🛡️ **Sheriff Badge Management** (one-time protection cards)
- 👹 **Criminal Status Tracking** (Normal → Angry → Mad)
- 📊 **Automatic Prize Calculation** (Top 3, Women, U10, U12, U16, U18)
- 🖨️ **Printable Pairings** (child-friendly format)
- 👥 **Player Management Interface** (add/edit players easily)
- 💾 **Auto-save to localStorage** (no database needed)
- 📱 **Responsive Design** (works on phones, tablets, laptops)

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Deploy to Vercel (FREE)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bounty-chess)

**Or via CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Your tournament will be live at: `https://your-project.vercel.app` 🎉

---

## 📋 Tournament Rules

### Starting Setup
- **9 rounds** Swiss system
- Each player starts with **20₱ bounty** and **1 sheriff protection badge**

### Bounty Transfer Rules
- **Winner steals half** of loser's bounty (rounded down)
- **Special Protections** (first 5 rounds only):
  - **Children U12**: lose only **1/4** of bounty
  - **Children U16**: lose only **1/3** of bounty  
  - **Women**: lose only **1/3** of bounty
- **If bounty ≤ 2**: lose everything on loss
- **Draws**: no bounty transfer
- **Uneven Bounties**: always rounded **down** to the lowest whole number (e.g., 6.67₱ loss becomes 6₱ loss)

### Sheriff Protection Badge (One-time use)
- ✅ **Declare before game starts**
- 🛡️ **On loss**: no bounty lost
- ⚡ **On win**: steal **1.2x** the normal amount
- 🔄 **If both use**: badges cancel out (normal game, both badges consumed)
- 🤬 **Mad criminal immunity**: Mad criminals are immune to opponent's sheriff protection
- ⏰ **Worthless after round 9**

### Criminal Status Evolution
- **Normal** → **Angry** (1 sheriff used against them) → **Mad** (2+ sheriffs)
- **Mad criminals** are **immune to opponent's sheriff protection** (opponent's sheriff has no special effect on Mad criminal, but is still consumed)

### Modified Swiss Pairing System
- **Pairs by bounty amount** (not traditional chess points)
- Highest bounties paired together
- **No repeat opponents** (players can't face the same opponent twice)
- **BYE players** get automatic win (+1 win, +0 bounty)

---

## 📖 Usage Guide

### For Tournament Organizers

#### **Before Tournament:**

1. **Import Players**
   - Upload CSV file OR paste CSV data
   - Use "Load Sample Data" for testing
   - OR manually add players via "Manage Players"

2. **Review Players**
   - Check ages, genders, categories are correct
   - Make last-minute additions/edits

3. **Start Tournament**
   - Click "🚀 Start Tournament" button
   - This locks player roster

#### **During Tournament:**

1. **Generate Pairings**
   - Click "Generate Round X Pairing"
   - Print pairings (🖨️ button)
   - Post boards for players

2. **Record Results**
   - Go to "♟️ Current Round"
   - For each game:
     - Check sheriff badge usage boxes (if used)
     - Click result button (White Wins/Black Wins/Draw)
     - System auto-calculates bounty transfers

3. **Next Round**
   - Click "Complete Round & Return to Leaderboard"
   - Repeat from step 1

#### **After Tournament:**

1. Check "🎖️ Prizes" page for automatic winner calculation
2. Export data for records

---

## 📁 CSV Import Format

**Expected columns:**

```
Player N°, Name, Surname, Birth date (DD/MM/YYYY), Current address, Meal, Payment proof, Transfer Name
```

**Example:**

```csv
Player N°,Name,Surname,Birth date,Current address,Meal,Payment proof,Transfer Name
1,John,Doe,15/03/2010,Port Louis,Veg,Yes,John's Dad
2,Jane,Smith,22/07/2015,Curepipe,Non-Veg,Yes,Jane's Mom
```

**Gender Detection:**
- Gender is auto-detected from first name
- Can be manually corrected in "Manage Players"

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + localStorage
- **Deployment:** Vercel (FREE)

---

## 📂 Project Structure

```
bounty/
├── app/
│   ├── page.tsx              # Main application logic
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── PlayerImport.tsx      # CSV import interface
│   ├── PlayerManager.tsx     # Manual player management
│   ├── Leaderboard.tsx       # Live standings
│   ├── RoundManager.tsx      # Game result recording
│   ├── Navigation.tsx        # App navigation
│   └── Prizes.tsx            # Winner calculation
├── lib/
│   ├── bounty.ts             # Bounty calculation logic
│   ├── pairing.ts            # Swiss pairing algorithm
│   ├── store.ts              # State management
│   └── utils.ts              # Helper functions
├── types/
│   └── index.ts              # TypeScript interfaces
└── public/
    └── sample-players.csv    # Sample data for testing
```

---

## 🎯 Key Features Explained

### 1. Bounty Calculation Engine
Complex logic handles:
- Base bounty transfer (50%)
- Age/gender protections (first 5 rounds)
- Sheriff badge effects (0x or 1.5x)
- Two sheriffs canceling
- Mad criminal immunity
- Bounty ≤ 2 rule
- Rounding down

### 2. Modified Swiss Pairing
- Sorts by bounty (not points)
- No repeat opponents
- BYE handling for odd players

### 3. Criminal Status Tracking
- Automatic progression: Normal → Angry → Mad
- Visual indicators in leaderboard
- Affects sheriff badge interactions

### 4. Prize Categories
Auto-calculates winners for:
- 🥇 Top 3 Overall
- 👩 Best Woman
- 🧒 Best U10, U12, U16, U18

---

## 🐛 Troubleshooting

### Data Not Saving?
- Data saves to browser's localStorage
- Use same device for entire tournament
- Export data regularly as backup

### Players Not Importing?
- Check CSV format matches expected columns
- Ensure birth dates are DD/MM/YYYY
- Try "Load Sample Data" first to test

### Pairings Look Wrong?
- System pairs by bounty (highest vs highest)
- Ensures no repeat opponents
- If odd players, lowest bounty gets BYE

### Can't Start Tournament?
- Must have at least 2 players imported
- Use "Manage Players" to add players
- Click "🚀 Start Tournament" in Leaderboard

---

## 📱 Mobile Support

- ✅ View leaderboard on phones
- ✅ Responsive design
- ⚠️ Recording results best on laptop/tablet

**Recommended Setup:**
- 1 laptop for arbiter (record results)
- Everyone else views leaderboard on their phones

---

## 📄 License

MIT License - Feel free to use for your tournaments!

---

## 🤝 Support

Created for **B4 Chess Club's Bounty Hunter Open 2025**

For issues or questions:
- Check documentation in `/docs` folder
- See `ARBITER_GUIDE.md` for quick reference
- See `USER_GUIDE_NON_TECHNICAL.md` for detailed walkthrough

---

## 🎉 Acknowledgments

Special format designed for fun, engaging chess tournaments with unique bounty mechanics!

**Good luck to all criminals! 🎯**

---

## 🔗 Quick Links

- **Vercel Deployment:** [vercel.com](https://vercel.com)
- **Next.js Docs:** [nextjs.org](https://nextjs.org)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)

---

**Ready to deploy?** → `vercel` 🚀
