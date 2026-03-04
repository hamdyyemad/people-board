# Development Setup for Subdomain i18n

## Option 1: Full Subdomain Setup (Recommended)

### 1. Update Hosts File

**Windows:**

1. Open **Notepad as Administrator**
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add:
   ```
   127.0.0.1 localhost
   127.0.0.1 ar.localhost
   ```
4. Save and close

**macOS/Linux:**

```bash
sudo nano /etc/hosts
```

Add:

```
127.0.0.1 localhost
127.0.0.1 ar.localhost
```

### 2. Clear DNS Cache

**Windows:**

```cmd
ipconfig /flushdns
```

**macOS:**

```bash
sudo dscacheutil -flushcache
```

**Linux:**

```bash
sudo systemctl restart systemd-resolved
```

### 3. Test Setup

```bash
# Start dev server
pnpm dev

# Test URLs
# English: http://localhost:3000
# Arabic: http://ar.localhost:3000
```

## Option 2: Query Parameter Fallback (Quick Setup)

If you can't modify the hosts file, the app will automatically fallback to query parameters:

- **English**: `http://localhost:3000`
- **Arabic**: `http://localhost:3000?lang=ar`

## Troubleshooting

### "ar.localhost refused to connect"

1. **Check hosts file**: Ensure `ar.localhost` is added
2. **Clear DNS cache**: Run the appropriate command above
3. **Restart browser**: Close and reopen your browser
4. **Check firewall**: Ensure localhost connections are allowed

### Language toggle not working

1. **Check console**: Look for JavaScript errors
2. **Verify middleware**: Ensure `src/middleware.ts` is in place
3. **Check i18n setup**: Verify translation files exist

## Production Deployment

For production, configure DNS:

- `yourdomain.com` → Your server
- `ar.yourdomain.com` → Your server

The middleware will handle routing automatically.
