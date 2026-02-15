# Translation Togglers Test Guide

## ✅ **All Translation Togglers Updated for Vercel**

I've updated all the translation togglers in your app to work properly with Vercel deployment:

### 1. **Main Language Toggle** (`LanguageToggle` component)

- **Location:** Login page (top-right corner)
- **File:** `src/frontend_lib/components/language-toggle.tsx`
- **Status:** ✅ Updated with Vercel detection and query parameter fallback

### 2. **Translation Example Button** (`TranslationExample` component)

- **Location:** Any page using this component
- **File:** `src/frontend_lib/components/translation-example.tsx`
- **Status:** ✅ Updated via `useAppTranslation` hook

### 3. **Translation Hook** (`useAppTranslation`)

- **File:** `src/frontend_lib/hooks/use-translation.ts`
- **Status:** ✅ Enhanced with Vercel-compatible `changeLanguage` function

### 4. **Subdomain Utilities** (`getLanguageFromSubdomain`)

- **File:** `src/frontend_lib/utils/subdomain.ts`
- **Status:** ✅ Updated to check query parameters first, then subdomains

## 🧪 **How to Test All Translation Togglers**

### Test 1: Main Language Toggle (Login Page)

1. Go to: `https://people-board-ecru.vercel.app/auth/login`
2. Click the flag button in the top-right corner
3. Should redirect to: `https://people-board-ecru.vercel.app/auth/login?lang=ar`
4. Click again to switch back to English

### Test 2: Translation Example Button (if used)

1. If you have a page with `TranslationExample` component
2. Click the language button in that component
3. Should work the same way with query parameters

export function TranslationExample() {
const { t, language, isRTL, changeLanguage } = useAppTranslation();

return (
<div className="p-4 bg-card text-card-foreground border border-border rounded-lg">
<h3 className="text-lg font-semibold mb-2">{t("welcome")}</h3>
<p className="text-muted-foreground">
Current language: <span className="font-medium">{language}</span>
</p>
<p className="text-sm text-muted-foreground mt-1">
Direction: <span className="font-medium">{isRTL ? "RTL" : "LTR"}</span>
</p>

      <div className="mt-4 space-y-2">
        <p>
          {t("login")}: {t("email")}
        </p>
        <p>
          {t("selectRole")}: {t("hr")} / {t("employee")}
        </p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => changeLanguage(isRTL ? "en" : "ar")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          {t("language")}: {isRTL ? "English" : "العربية"}
        </button>
      </div>
    </div>

);
}

### Test 3: Direct URL Testing

1. **English:** `https://people-board-ecru.vercel.app/auth/login`
2. **Arabic:** `https://people-board-ecru.vercel.app/auth/login?lang=ar`

## 🔧 **What Was Fixed**

### Before (Broken on Vercel):

- Translation togglers used `i18n.changeLanguage()` which only changed the language state
- No URL changes, so refreshing the page would lose the language setting
- Subdomain detection failed on Vercel

### After (Working on Vercel):

- All translation togglers now use URL-based language switching
- Query parameters (`?lang=ar`) work as fallback for Vercel
- Language persists on page refresh
- Automatic detection of Vercel environment

## 📁 **Files Modified**

1. `src/frontend_lib/hooks/use-translation.ts` - Enhanced `changeLanguage` function
2. `src/frontend_lib/utils/subdomain.ts` - Added query parameter support
3. `src/middleware.ts` - Already updated to handle query parameters
4. `src/frontend_lib/components/language-toggle.tsx` - Already updated for Vercel

## 🚀 **Deploy and Test**

```bash
git add .
git commit -m "Fix all translation togglers for Vercel deployment"
git push
```

After deployment, all translation togglers should work perfectly on Vercel using query parameters!
