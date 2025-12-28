# 🔧 VERCEL ENVIRONMENT VARIABLES SETUP

**IMPORTANT:** Before deploying, you MUST add your Supabase credentials to Vercel!

---

## 📝 **STEP-BY-STEP:**

### **1. Go to Vercel Dashboard**

https://vercel.com/righens-projects/bounty/settings/environment-variables

### **2. Add These Environment Variables:**

Click **"Add New"** for each:

#### **Variable 1:**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://kvuwxmamcrliunonrouf.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### **Variable 2:**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXd4bWFtY3JsaXVub25yb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTczNjksImV4cCI6MjA4MjQzMzM2OX0.T0xQZDdFyOQAZi2mZXftkGKK226XawCq9_8DfL-rXZ8`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **3. Save**

Click **"Save"** after adding each variable.

---

## ✅ **DONE!**

After adding these, your next deployment will use Supabase!

---

## 🚀 **THEN DEPLOY:**

Push to GitHub and Vercel will auto-deploy:

```bash
git push
```

Or manually deploy:

```bash
vercel --prod
```




