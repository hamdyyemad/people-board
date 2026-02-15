# Subdomain-Based Internationalization Setup

This project uses subdomain-based routing for internationalization instead of client-side language switching.

## How It Works

- **English (default)**: `localhost:3000` or `yourdomain.com`
- **Arabic**: `ar.localhost:3000` or `ar.yourdomain.com`

## Local Development Setup

### 1. Update Your Hosts File

Add these entries to your hosts file:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux**: `/etc/hosts`

```
127.0.0.1 localhost
127.0.0.1 ar.localhost
```

### 2. Start Development Server

```bash
pnpm dev
```

### 3. Test the Setup

- **English**: http://localhost:3000
- **Arabic**: http://ar.localhost:3000

## How Language Switching Works

1. **Click Language Toggle**: User clicks the flag button
2. **Subdomain Redirect**: Browser redirects to appropriate subdomain
3. **Server-Side Detection**: Middleware detects subdomain and sets language
4. **Content Updates**: All content updates immediately

## Benefits

- ✅ **SEO Friendly**: Each language has its own URL
- ✅ **Server-Side**: Language detection happens on the server
- ✅ **Instant Switching**: No double-click issues
- ✅ **Bookmarkable**: Users can bookmark specific language versions
- ✅ **Search Engine Indexing**: Each language is properly indexed

## File Structure

```
src/
├── middleware.ts                    # Next.js middleware for subdomain routing
├── frontend_lib/
│   ├── lib/i18n.ts                 # i18next configuration
│   ├── components/
│   │   ├── language-toggle.tsx     # Subdomain-aware language toggle
│   │   └── i18n-provider.tsx       # Client-side i18n provider
│   ├── hooks/
│   │   └── use-translation.ts      # Translation hook
│   └── utils/
│       └── subdomain.ts            # Subdomain utility functions
└── locales/
    ├── en/common.json              # English translations
    └── ar/common.json              # Arabic translations
```

## Usage in Components

```tsx
import { useAppTranslation } from "@/frontend_lib/hooks/use-translation";

function MyComponent() {
  const { t, language, isRTL } = useAppTranslation();

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <h1>{t("welcome")}</h1>
      <p>Current language: {language}</p>
    </div>
  );
}
```

## Production Deployment

For production, ensure your DNS is configured to point both domains to your server:

- `yourdomain.com` → Your server
- `ar.yourdomain.com` → Your server

The middleware will handle the routing automatically.
