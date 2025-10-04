# Internationalization (i18n) Setup

This project uses **subdomain-based routing** with i18next for internationalization, supporting English and Arabic languages.

## 🌍 How It Works

- **English (default)**: `http://localhost:3000` or `yourdomain.com`
- **Arabic**: `http://ar.localhost:3000` or `ar.yourdomain.com`

## 📁 Structure

```
src/locales/
├── en/
│   └── common.json    # English translations
├── ar/
│   └── common.json    # Arabic translations
└── README.md
```

## 🚀 Usage

### In Components

```tsx
import { useAppTranslation } from "@/frontend_lib/hooks/use-translation";

function MyComponent() {
  const { t, language, isRTL } = useAppTranslation();

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <h1>{t("welcome")}</h1>
      <p>{t("login")}</p>
    </div>
  );
}
```

### Language Toggle

```tsx
import { LanguageToggle } from "@/frontend_lib/components/language-toggle";

<LanguageToggle size="md" showText={false} />;
```

## 🔧 Prerequisites

**⚠️ IMPORTANT**: Update your hosts file for subdomain routing to work:

### Windows

```
C:\Windows\System32\drivers\etc\hosts
```

Add:

```
127.0.0.1 localhost
127.0.0.1 ar.localhost
```

### macOS/Linux

```
/etc/hosts
```

Add:

```
127.0.0.1 localhost
127.0.0.1 ar.localhost
```

## 📝 Adding New Translations

1. **Add keys to both files**:

   ```json
   // en/common.json
   {
     "newKey": "English text"
   }

   // ar/common.json
   {
     "newKey": "النص العربي"
   }
   ```

2. **Use in components**:
   ```tsx
   const { t } = useAppTranslation();
   return <h1>{t("newKey")}</h1>;
   ```

## ✨ Features

- ✅ **Subdomain-based**: Each language has its own URL
- ✅ **Server-side**: Language detection happens on the server
- ✅ **RTL Support**: Automatic direction switching for Arabic
- ✅ **SVG Flags**: Custom flag components for US and Egypt
- ✅ **Type Safe**: Full TypeScript support
- ✅ **SEO Friendly**: Each language is properly indexed
- ✅ **Bookmarkable**: Users can bookmark specific language versions
