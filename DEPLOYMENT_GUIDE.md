# 🚀 VERCEL DEPLOYMENT GUIDE

## ✅ PREPARATION COMPLETE!

I've already done the following for you:
- ✅ Created `.gitignore` file
- ✅ Updated `README.md` with deployment info
- ✅ Initialized git repository
- ✅ Committed all files
- ✅ Installed Vercel CLI

---

## 📝 STEP-BY-STEP DEPLOYMENT

### STEP 1: Create GitHub Repository (5 minutes)

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top-right) → **"New repository"**
3. Fill in:
   - **Repository name:** `bounty-chess-tournament` (or any name you prefer)
   - **Description:** "Bounty Chess Tournament Management System"
   - **Visibility:** Public (or Private, up to you)
   - **DO NOT** check "Initialize with README" (we already have one)
4. Click **"Create repository"**

5. Copy the commands shown (should look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/bounty-chess-tournament.git
git branch -M main
git push -u origin main
```

6. **Run those commands in your terminal:**

```bash
cd /Users/righensawmynaden/Code/bounty
git remote add origin https://github.com/YOUR_USERNAME/bounty-chess-tournament.git
git branch -M main
git push -u origin main
```

---

### STEP 2: Deploy to Vercel (2 minutes)

**Run this command:**

```bash
cd /Users/righensawmynaden/Code/bounty
vercel
```

**Follow the prompts:**

1. **"Set up and deploy?"** → Press `Y` (Yes)
2. **"Which scope?"** → Choose your account (press Enter)
3. **"Link to existing project?"** → Press `N` (No)
4. **"What's your project's name?"** → Press Enter (use default) or type a custom name
5. **"In which directory is your code located?"** → Press Enter (use `.`)
6. **"Want to modify these settings?"** → Press `N` (No)

⏳ **Wait ~60 seconds** for deployment...

✅ **You'll see:**
```
✅  Production: https://bounty-chess-tournament-xyz123.vercel.app [copied]
```

🎉 **That's your live URL!**

---

### STEP 3: Test Your Live Site

1. Open the URL in your browser
2. Test the workflow:
   - Import sample data
   - Start tournament
   - Generate pairings
   - Record a result

---

## 🔗 YOUR DEPLOYMENT URLS

After deployment, you'll have:

- **🌐 Production URL:** `https://your-project.vercel.app`
- **📊 Vercel Dashboard:** `https://vercel.com/dashboard`
- **🔧 Project Settings:** `https://vercel.com/your-username/your-project`

---

## 🎯 SHARE WITH PARTICIPANTS

Once deployed, share this message:

```
🎯 Bounty Chess Tournament 2025
📊 Live Leaderboard: https://your-project.vercel.app
🏆 Watch the tournament in real-time!
📱 Bookmark and follow the action!
```

---

## ⚙️ AUTOMATIC DEPLOYMENTS

**Good news:** Every time you push to GitHub, Vercel automatically redeploys!

```bash
# Make changes to your code
git add .
git commit -m "Update tournament rules"
git push

# Vercel automatically deploys the new version! 🎉
```

---

## 🔄 USEFUL COMMANDS

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open project in browser
vercel open

# Check deployment status
vercel ls

# Remove project (if you want to start over)
vercel rm bounty-chess-tournament
```

---

## 💡 PRO TIPS

### 1. **Custom Domain (Optional)**
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain (if you have one)
- Follow DNS setup instructions

### 2. **Environment Variables (If Needed Later)**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add any secrets or API keys here

### 3. **Preview Deployments**
- Every git branch gets its own preview URL
- Perfect for testing before going live

### 4. **Analytics**
- Vercel provides free analytics
- See page views, performance, etc.

---

## 🆘 TROUBLESHOOTING

### "Failed to push to GitHub"
**Solution:**
```bash
# Check if remote is set
git remote -v

# If no remote, add it:
git remote add origin https://github.com/YOUR_USERNAME/your-repo.git

# Try again
git push -u origin main
```

### "Build failed on Vercel"
**Solution:**
- Check build logs in Vercel dashboard
- Most likely: missing dependencies
- Run locally first: `npm run build`

### "Page not found after deployment"
**Solution:**
- Wait 1-2 minutes for DNS propagation
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel dashboard for deployment status

### "Data not saving on live site"
**This is NORMAL:**
- Each device has its own localStorage
- Run tournament from ONE device (arbiter laptop)
- Others can VIEW but shouldn't edit

---

## 📱 RECOMMENDED SETUP FOR TOURNAMENT

### **Arbiter Laptop:**
- Opens: `https://your-app.vercel.app`
- Records all results
- Manages tournament

### **Participants (their phones):**
- Opens same URL: `https://your-app.vercel.app`
- View leaderboard only
- See real-time updates

### **Important:**
- Export data after each round (backup)
- Keep arbiter laptop charged
- Have backup device ready (just in case)

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Step 1: Created GitHub repository
- [ ] Step 1: Pushed code to GitHub
- [ ] Step 2: Ran `vercel` command
- [ ] Step 2: Logged in with GitHub
- [ ] Step 2: Completed deployment
- [ ] Step 3: Tested live URL
- [ ] Step 3: Imported sample data
- [ ] Step 3: Ran test round
- [ ] Step 4: Shared URL with participants
- [ ] Step 4: Posted on Facebook/WhatsApp

---

## 🎉 YOU'RE READY!

Once deployed, your tournament system will be:
- ✅ Live on the internet
- ✅ Accessible from any device
- ✅ Fast and responsive
- ✅ Automatically backed up
- ✅ Free forever (Vercel free tier)

**Good luck with the tournament tomorrow! 🎯♟️**

---

## 📞 NEED HELP?

If you get stuck during deployment:
1. Check the error message
2. Look at Vercel dashboard logs
3. Run `npm run build` locally to test
4. Check GitHub repository exists and code is pushed

---

**Next Steps:**
1. Follow STEP 1 to push to GitHub
2. Follow STEP 2 to deploy to Vercel
3. Test your live URL
4. Share with participants! 🎉

