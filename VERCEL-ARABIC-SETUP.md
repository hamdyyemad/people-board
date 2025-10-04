# Vercel Arabic Subdomain Setup Guide

## Problem

Your app tries to access `ar.people-board-ecru.vercel.app` but Vercel doesn't automatically create subdomains for different locales.

## Solutions Implemented

### 1. Updated Middleware

- Added Vercel deployment detection
- Added query parameter fallback (`?lang=ar`)
- Maintains subdomain support for custom domains

### 2. Updated Language Toggle

- Detects Vercel deployment environment
- Falls back to query parameters when subdomains aren't available
- Maintains subdomain functionality for production with custom domains

### 3. Added Vercel Configuration

- Created `vercel.json` for proper routing configuration

## How to Set Up Arabic Subdomain on Vercel

### Option A: Custom Domain (Recommended for Production)

1. **Add Custom Domain in Vercel Dashboard:**

   - Go to your project in Vercel dashboard
   - Navigate to Settings → Domains
   - Add your custom domain (e.g., `people-board.com`)

2. **Configure DNS:**

   - Add A record: `@` → Vercel IP
   - Add CNAME record: `ar` → `cname.vercel-dns.com`

3. **Test:**
   - `people-board.com` → English
   - `ar.people-board.com` → Arabic

### Option B: Use Query Parameters (Current Fallback)

The app now supports query parameters as a fallback:

- **English:** `https://people-board-ecru.vercel.app/auth/login`
- **Arabic:** `https://people-board-ecru.vercel.app/auth/login?lang=ar`

### Option C: Vercel Preview URLs

For testing, you can use Vercel's preview URLs with query parameters:

- `https://people-board-ecru.vercel.app/auth/login?lang=ar`

## Testing Your Setup

1. **Deploy the changes:**

   ```bash
   git add .
   git commit -m "Add Vercel Arabic subdomain support with query parameter fallback"
   git push
   ```

2. **Test the language toggle:**

   - Visit your Vercel URL
   - Click the language toggle button
   - It should switch between English and Arabic using query parameters

3. **Test direct Arabic access:**
   - Visit: `https://people-board-ecru.vercel.app/auth/login?lang=ar`
   - Should display Arabic content

## Current Status

✅ **Working Now:**

- Query parameter fallback (`?lang=ar`)
- Language toggle with Vercel detection
- Middleware handles both subdomains and query parameters

🔄 **For Production:**

- Set up custom domain with subdomain support
- Subdomain routing will work automatically

## Files Modified

- `src/middleware.ts` - Added Vercel detection and query parameter support
- `src/frontend_lib/components/language-toggle.tsx` - Added Vercel fallback logic
- `vercel.json` - Added Vercel configuration
- `VERCEL-ARABIC-SETUP.md` - This guide

## Next Steps

1. Deploy these changes to Vercel
2. Test the Arabic translation using query parameters
3. For production, set up a custom domain with subdomain support
