# Database Setup Guide

## Problem Solved
You were getting an environment variable conflict because Vercel was trying to create `DATABASE_URL` but it already existed.

## Solution Steps

### 1. Vercel Dashboard Setup

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** > **Postgres**
4. **IMPORTANT**: When prompted for "Environment Variables Prefix", use:
   - **Leave it empty** (default), OR
   - Use `POSTGRES` as prefix
5. Choose your regions and create the database

### 2. Environment Variables

After creating the database, Vercel will automatically add these environment variables to your project:
- `DATABASE_URL` (if no prefix)
- Or `POSTGRES_DATABASE_URL` (if using POSTGRES prefix)

### 3. Local Development

Copy the database URL from Vercel dashboard and update your `.env` file:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### 4. Deploy Database Schema

Run these commands to set up your database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Verify Connection

Test the connection by running:

```bash
npm run dev
```

Then visit: http://localhost:3000/api/health

## Alternative Solution

If you still get conflicts, you can:

1. Use a custom prefix like `MYAPP` when creating Vercel storage
2. Update your Prisma schema to use `MYAPP_DATABASE_URL`
3. Update your `.env` file accordingly

## Troubleshooting

### Error: "Environment variable not found"
- Make sure the `.env` file exists and has the correct `DATABASE_URL`
- Verify the database URL format is correct

### Error: "Can't reach database server"
- Check if the database URL includes the correct SSL mode: `?sslmode=require`
- Verify your IP is allowed (Vercel Postgres usually allows all IPs)

### Error: "Table doesn't exist"
- Run `npm run db:push` to create tables
- Or run `npm run db:migrate` if you prefer migrations

## Commands Reference

```bash
# Development
npm run dev

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Create and run migrations
npm run db:reset      # Reset database (WARNING: deletes all data)

# Production build
npm run vercel-build  # Includes database setup
```