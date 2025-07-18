# 🗺️ Better Address Geocoding Setup

Your app currently uses **Nominatim** which has limited house number accuracy. Set up **LocationIQ** for much better address completion!

## 🥇 **LocationIQ (Recommended)**

- **✅ Much better accuracy** for house numbers and addresses
- **✅ 5,000 requests/day FREE**
- **✅ No credit card required**
- **✅ Enhanced version of Nominatim**

### 🚀 **Quick Setup (2 minutes):**

1. **Go to [locationiq.com](https://locationiq.com/)** and create free account
2. **Get your API key** from the dashboard
3. **Create `.env.local` file** in your `frontend/` folder:

```bash
NEXT_PUBLIC_LOCATIONIQ_TOKEN=pk.your_token_here
```

4. **Restart your dev server**: `npm run dev`

That's it! 🎉

## 🔍 **The Difference**

**Before (Nominatim - current):**

- Enter "123 Main St, New York"
- Get: "Main Street, Various Cities" ❌
- Limited house number recognition

**After (LocationIQ):**

- Enter "123 Main St, New York"
- Get: "123 Main Street, New York, NY 10001" ✅
- Accurate house numbers and addresses

## 🟠 **Nominatim (Current - Fallback)**

- **⚠️ Basic accuracy** (what you're experiencing now)
- **✅ Completely free** - no signup required
- **❌ Limited house number coverage**

This runs automatically when no LocationIQ token is set.

## 📁 **File Structure**

```
frontend/
├── .env.local          ← Create this file
├── src/lib/api.ts      ← Geocoding logic
└── GEOCODING_SETUP.md  ← This guide
```

## 🔧 **Example .env.local File**

```bash
# LocationIQ API Token for better address completion
NEXT_PUBLIC_LOCATIONIQ_TOKEN=pk.12345abcdef...

# Restart your dev server after adding:
# npm run dev
```

## 🧪 **Testing**

Try searching for addresses with house numbers:

- Type "123" and see specific house numbers appear in suggestions
- Much better parsing of full addresses
- More accurate coordinate results

The status indicator in the "Add Job" form shows which service is active:

- 🟢 **LocationIQ (Enhanced)** - with LocationIQ token
- 🟠 **Nominatim (Basic)** - no token (current experience)

## 🎯 **Benefits**

- **Better house number recognition**
- **More accurate suggestions** as you type
- **Enhanced address parsing**
- **5,000 requests/day** should cover most usage
- **Free tier with no credit card** required

---

**💡 Ready to upgrade?** Just follow the setup above and you'll immediately see much better address completion!
