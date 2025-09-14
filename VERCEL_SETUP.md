# Vercel Deployment Setup Guide

## ❌ Current Issue
Deployment failing with error: `the URL must start with the protocol postgresql:// or postgres://`

## ✅ Solution Steps

### 1. Add Environment Variables to Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com/dashboard)
   - Find your project (likely named `test`)

2. **Navigate to Environment Variables:**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add DATABASE_URL:**
   - Click **Add New** button
   - **Name:** `DATABASE_URL`
   - **Value:** `postgres://f545e77ab7d5ff85e02f78a4ea3dd061e8844b3bd980ffc472a84ba057c1d70c:sk_XcEK1NOh6ljDHTkONLyqP@db.prisma.io:5432/postgres?sslmode=require`
   - **Environments:** Select all (Production, Preview, Development)
   - Click **Save**

4. **Optional - Add Backup Variables:**
   - **Name:** `POSTGRES_PRISMA_DATABASE_URL`
   - **Value:** Same as DATABASE_URL
   - **Name:** `PRISMA_ACCELERATE_URL`
   - **Value:** `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19YY0VLMU5PaDZsakRIVGtPTkx5cVAiLCJhcGlfa2V5IjoiMDFLNTJZNDhFU0IyQzMzM1dGRENKV0RTU1AiLCJ0ZW5hbnRfaWQiOiJmNTQ1ZTc3YWI3ZDVmZjg1ZTAyZjc4YTRlYTNkZDA2MWU4ODQ0YjNiZDk4MGZmYzQ3MmE4NGJhMDU3YzFkNzBjIiwiaW50ZXJuYWxfc2VjcmV0IjoiYTQ0YTIxMTYtNTNiNi00OTFiLTkxODgtYzY5NDc5ZDRmMzc1In0.bQm9acKAytp6rVwKtUCqzOmM70A-u6g2axaoleCJll0`

### 2. Redeploy

After adding the environment variables:
1. Go back to your project dashboard
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

### 3. Verify Environment Variables

You can verify the environment variables are properly set by:
1. Going to **Settings** > **Environment Variables**
2. You should see `DATABASE_URL` listed
3. The value should show as `(Hidden)` for security

## 🔧 Alternative Method: Using Vercel CLI

If you prefer using CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add DATABASE_URL

# When prompted, paste your database URL:
# postgres://f545e77ab7d5ff85e02f78a4ea3dd061e8844b3bd980ffc472a84ba057c1d70c:sk_XcEK1NOh6ljDHTkONLyqP@db.prisma.io:5432/postgres?sslmode=require

# Select all environments (Production, Preview, Development)

# Redeploy
vercel --prod
```

## 🎯 Expected Result

After adding the environment variables and redeploying:
- ✅ Build should complete successfully
- ✅ Database schema will be pushed during build
- ✅ Application will be live and accessible
- ✅ Health check at `/api/health` should show database connection

## 🚨 Common Issues

### Issue: "Environment variable not found"
**Solution:** Make sure you added `DATABASE_URL` exactly as shown, with all environments selected.

### Issue: "Invalid database URL"
**Solution:** Verify the URL format is correct and includes `?sslmode=require` at the end.

### Issue: "Build still failing"
**Solution:** 
1. Clear build cache: Redeploy with "Clear Cache" option
2. Check that all environment variables are properly saved
3. Try redeploying from a fresh commit

## 📞 Need Help?

If you're still having issues:
1. Check the Vercel build logs for specific error messages
2. Verify the environment variables are properly set in Vercel dashboard
3. Make sure your GitHub repository is properly connected to Vercel