# Troubleshooting Guide

## CSS Not Loading / Styles Not Appearing

If you see unstyled content or CSS isn't loading:

### Solution 1: Hard Refresh Browser
1. **Chrome/Edge**: Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. **Firefox**: Press `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. **Safari**: Press `Cmd + Option + R`

### Solution 2: Clear Browser Cache
1. Open Developer Tools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 3: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Solution 4: Clear Next.js Cache
```bash
# Stop the server
rm -rf .next
npm run dev
```

### Solution 5: Verify Tailwind is Working
Check the Network tab in browser DevTools:
1. Open DevTools (`F12`)
2. Go to "Network" tab
3. Refresh the page
4. Look for CSS files loading (should see compiled CSS)

## Common Issues

### "Page shows but no styling"
- **Cause**: Browser cached old CSS
- **Fix**: Hard refresh (Ctrl + Shift + R)

### "All text is black and white"
- **Cause**: CSS not loading at all
- **Fix**: 
  1. Check that `app/layout.tsx` imports `./globals.css`
  2. Restart dev server
  3. Clear browser cache

### "Some components look broken"
- **Cause**: Missing Tailwind classes
- **Fix**: This is expected - some components need to be built out

## Verification Steps

1. **Check if Tailwind is compiling**:
   ```bash
   # You should see no errors
   npm run dev
   ```

2. **Inspect element in browser**:
   - Right-click any element → "Inspect"
   - Check if Tailwind classes are being applied
   - Look for `bg-primary`, `text-foreground`, etc.

3. **Check console for errors**:
   - Open browser console (`F12` → Console tab)
   - Look for any CSS loading errors

## Still Having Issues?

If CSS still isn't loading after trying all solutions:

1. **Check browser console** for specific errors
2. **Verify file structure**:
   ```bash
   ls -la app/globals.css
   ls -la tailwind.config.ts
   ls -la postcss.config.mjs
   ```

3. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

## Expected Behavior

When working correctly, you should see:
- ✅ Colorful UI with blue primary colors
- ✅ Smooth shadows and rounded corners
- ✅ Proper spacing and typography
- ✅ Dark/light mode toggle working
- ✅ Responsive layout on mobile

## Screenshot Reference

The landing page should show:
- Blue gradient header with "LocalGrid" logo
- Large hero text with gradient effect
- Stats showing "10K+ Active Users", etc.
- Feature cards with icons
- Professional footer

If you don't see this styling, follow the solutions above.
