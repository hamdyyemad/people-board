# People Board - HR & Employee Dashboard

A modern HR and employee dashboard built with Next.js, featuring subdomain-based internationalization, dark/light mode, and role-based authentication.

## 🌍 Internationalization (i18n)

This project uses **subdomain-based routing** for internationalization:

- **English**: `http://localhost:3000` or `yourdomain.com`
- **Arabic**: `http://ar.localhost:3000` or `ar.yourdomain.com`

### Prerequisites for Local Development

**⚠️ IMPORTANT**: You must update your hosts file to enable subdomain routing.

#### Windows Setup

1. **Open Notepad as Administrator**
2. **Open file**: `C:\Windows\System32\drivers\etc\hosts`
3. **Add these lines** at the end:
   ```
   127.0.0.1 localhost
   127.0.0.1 ar.localhost
   ```
4. **Save the file**
5. **Clear DNS cache**: Run `ipconfig /flushdns` in Command Prompt
6. **Restart your browser**

#### macOS/Linux Setup

1. **Open terminal**
2. **Edit hosts file**: `sudo nano /etc/hosts`
3. **Add these lines**:
   ```
   127.0.0.1 localhost
   127.0.0.1 ar.localhost
   ```
4. **Save and exit** (Ctrl+X, Y, Enter)
5. **Clear DNS cache**:
   - **macOS**: `sudo dscacheutil -flushcache`
   - **Linux**: `sudo systemctl restart systemd-resolved`
6. **Restart your browser**

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Then test both language versions:

- **English**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Arabic**: [http://ar.localhost:3000/auth/login](http://ar.localhost:3000/auth/login)

## ✨ Features

- 🌍 **Subdomain-based i18n** with English/Arabic support
- 🎨 **Dark/Light mode** with persistent theme switching
- 🏢 **Role-based authentication** (HR Manager / Employee)
- 📱 **Responsive design** with mobile optimization
- 🎯 **SVG flag components** for language switching
- 🔄 **RTL/LTR support** for Arabic content
- ⚡ **Server-side rendering** with Next.js 15
- 🎭 **Smooth animations** and transitions
- 🏪 **Zustand state management** for global locale state
- 🎪 **Infinity slideshow** with animated testimonials
- 🎨 **Card flip animations** for login flow

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── auth/login/           # Login page with i18n
│   │   └── shared/               # Shared components
│   ├── employee/                 # Employee dashboard
│   ├── hr/                       # HR dashboard
│   └── layout.tsx                # Root layout with providers
├── frontend_lib/                 # Shared library
│   ├── components/               # Reusable components
│   │   ├── flags/                # SVG flag components
│   │   ├── language-toggle.tsx   # Language switcher
│   │   ├── theme-toggle.tsx      # Theme switcher
│   │   ├── locale-provider.tsx   # Locale state provider
│   │   └── ui/                   # UI components
│   ├── hooks/                    # Custom hooks
│   │   ├── use-translation.ts    # i18n hook
│   │   └── use-mobile.tsx        # Mobile detection
│   ├── lib/                      # Utilities
│   │   └── i18n.ts              # Server-side i18n functions
│   ├── stores/                   # Zustand stores
│   │   ├── locale-store.ts       # Global locale state
│   │   └── theme-store.ts        # Theme state
│   └── utils/                    # Helper functions
│       └── subdomain.ts          # Subdomain utilities
├── locales/                      # Translation files
│   ├── en/common.json           # English translations
│   └── ar/common.json           # Arabic translations
└── middleware.ts                 # Next.js middleware for subdomain routing
```

## 🚀 Usage

### Language Switching

Click the flag button in the top-right corner to switch between languages:

- **Egypt flag** 🇪🇬 → Switch to Arabic
- **US flag** 🇺🇸 → Switch to English

### Theme Switching

Click the theme toggle button to switch between light and dark modes:

- **Moon icon** 🌙 → Switch to dark mode
- **Sun icon** ☀️ → Switch to light mode

## 🏗️ Architecture

### Server/Client Component Pattern

This project uses a **server-first approach** for internationalization:

#### 🔧 **Server Components** (fetch translations)

```tsx
// Server Component - fetches translations
export async function MyComponentServer() {
  const translations = await getTranslations();
  return <MyComponent translations={translations} />;
}
```

#### 🎨 **Client Components** (receive translations as props)

```tsx
// Client Component - receives translations
"use client";
export function MyComponent({
  translations,
}: {
  translations: Record<string, string>;
}) {
  const t = (key: string) => translations[key] || key;
  return <h1>{t("title")}</h1>;
}
```

#### 💡 **Key Tip**:

> **If you have a client component that needs translations, wrap it inside a server component that fetches the translations and passes them as props.**

This pattern ensures:

- ✅ **Server-side rendering** - No flash of untranslated content
- ✅ **Performance** - Only required translation files are loaded
- ✅ **Type safety** - Translations are typed as `Record<string, string>`
- ✅ **Clean separation** - Server handles data, client handles interactivity

### State Management

#### 🌍 **Locale State** (Zustand)

```tsx
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

function MyComponent() {
  const { locale, isRTL } = useLocaleStore();
  // Use locale and isRTL throughout the component
}
```

#### 🎨 **Theme State** (Zustand)

```tsx
import { useThemeStore } from "@/frontend_lib/stores/theme-store";

function MyComponent() {
  const { theme, toggleTheme } = useThemeStore();
  // Use theme state
}
```

### Adding New Translations

1. **Add keys to translation files**:

   ```json
   // src/locales/en/common.json
   {
     "newKey": "English text"
   }

   // src/locales/ar/common.json
   {
     "newKey": "النص العربي"
   }
   ```

2. **Create server component wrapper**:

   ```tsx
   // Server Component - fetches translations
   import { getTranslations } from "@/frontend_lib/lib";
   import { MyComponent } from "./my-component";

   export async function MyComponentServer() {
     const translations = await getTranslations();
     return <MyComponent translations={translations} />;
   }
   ```

3. **Use in client component**:

   ```tsx
   // Client Component - receives translations
   "use client";
   import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

   interface MyComponentProps {
     translations: Record<string, string>;
   }

   export function MyComponent({ translations }: MyComponentProps) {
     const isRTL = useLocaleStore((state) => state.isRTL);
     const t = (key: string) => translations[key] || key;

     return (
       <div className={isRTL ? "text-right" : "text-left"}>
         <h1>{t("newKey")}</h1>
       </div>
     );
   }
   ```

4. **Use the server component in your pages**:

   ```tsx
   import { MyComponentServer } from "./my-component-server";

   export default function Page() {
     return <MyComponentServer />;
   }
   ```

## 🆕 Latest Updates

### Recent Improvements

- ✅ **Eliminated prop drilling** - Using Zustand for global locale state
- ✅ **Server-side translations** - No flash of untranslated content
- ✅ **RTL layout fixes** - Proper Arabic text alignment and spacing
- ✅ **Mobile optimization** - Conditional rendering to prevent unnecessary downloads
- ✅ **Card flip animations** - Smooth transitions in login flow
- ✅ **Infinity slideshow** - Animated testimonials with proper RTL support
- ✅ **Companies section** - RTL-aware scrolling animation

### Architecture Benefits

- 🚀 **Performance**: Only required translation files are loaded
- 🧹 **Clean code**: No prop drilling, global state management
- 🌍 **RTL support**: Proper Arabic layout and spacing
- ⚡ **SSR**: Server-side rendering with client-side interactivity
- 💾 **Persistence**: Theme and locale state persist across sessions

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Updated hosts file (see Prerequisites section above)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd people-board

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Testing Subdomain Setup

```bash
# Test English version
curl http://localhost:3000/auth/login

# Test Arabic version
curl http://ar.localhost:3000/auth/login
```

## 🚀 Production Deployment

For production, configure your DNS to point both domains to your server:

- `yourdomain.com` → Your server IP
- `ar.yourdomain.com` → Your server IP

The middleware will automatically handle subdomain routing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

This project is **Proprietary – View Only**.

You may view the source code for reference or educational purposes, but you may **not** copy, use, modify, or distribute any part of this codebase without explicit written permission.

> © 2025 Hamdy Emad  
> Contact: [hamdyyemad@aol.com](mailto:hamdyyemad@aol.com)
