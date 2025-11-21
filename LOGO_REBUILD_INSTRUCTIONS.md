# IntakeLegal Logo Rebuild Instructions

## Status: ⚠️ AWAITING EXACT VECTOR ASSETS

This branch (`fix/brand-logo-exact-v1`) has been prepared with placeholder SVGs and integration code. **You must complete the vector tracing and replace the placeholders before merging.**

---

## 📋 Required Steps

### 1. Obtain Reference Image

The logo reference image should be at:
- Path: `/mnt/data/1000105232.jpg` (or provide alternative location)
- If not available, upload the reference image to the repository

### 2. Vector Tool Setup

**Recommended tools:**
- Figma (easiest, browser-based)
- Inkscape (free, cross-platform)
- Adobe Illustrator (professional)

**Setup:**
```
1. Create artboard: 2000×800 px
2. Import reference image, center it
3. Set opacity: 40%, lock layer
4. Enable: Snap to pixel grid (4px intervals)
```

### 3. Rebuild Logo Mark (Crescent + Ribbon)

**Geometry specifications:**

```
Outer crescent:
- Radius: R = 300px
- Arc angle: 210° (opening bottom-right)
- Created by: Circle R=300px MINUS Circle r=240px + 120° sector mask

Inner ribbon:
- Source: Duplicate inner circle (r=240px)
- Offset: -34px inward
- Rotation: ~18° clockwise
- Stroke width: 34px (constant)
- Convert: Expand Stroke → Fill

Colors (sample from reference):
- Primary yellow: #F9C051 (outer crescent)
- Secondary yellow: #F7B43C (inner ribbon)
```

**Precision requirements:**
- All curves must be perfect circles/arcs (no freehand)
- Edge deviation from reference: ≤1 px
- Use as few anchor points as possible
- Bézier handles: symmetric, cubic

### 4. Rebuild Wordmark ("IntakeLegal")

**Font matching procedure:**

Test in order at **600-620px size, weight 600**:

1. Inter SemiBold
2. Manrope SemiBold  
3. Work Sans SemiBold
4. Nunito Sans SemiBold
5. Avenir Next Medium

**For each candidate:**
```
1. Type "IntakeLegal"
2. Set tracking: 0 initially
3. Overlay on reference at 100% zoom
4. Adjust kerning per letter pair
5. Accept if stem/bowl deviation ≤1 px
```

**If no match:**
- Manually trace with Pen tool
- One continuous outline per glyph
- Convert to cubic Béziers
- Do NOT use auto-trace

**Finalization:**
```
1. Convert text to outlines
2. Unite shapes
3. Remove overlaps
4. Fill: #FFFFFF (white)
5. Stroke: none
```

### 5. Alignment & Spacing

**Critical measurements:**

```
Horizontal gap (mark → wordmark): 26-30px
Baseline alignment: Mark's lowest point = Wordmark baseline
Height ratio: Wordmark height = Mark cap height (optical, not geometric)
```

**Verify:**
- No optical misalignment when viewed at actual size
- Logo feels balanced, not tilted or offset

### 6. Export Assets

**Replace these placeholder files:**

```bash
# SVG (source of truth)
web/public/brand/intakelegal-wordmark.svg  # Mark + Wordmark
web/public/brand/intakelegal-mark.svg      # Mark only

# PNG fallbacks (export at these exact sizes)
web/public/brand/intakelegal-wordmark@1x.png  # 400×160 px
web/public/brand/intakelegal-wordmark@2x.png  # 800×320 px
web/public/brand/intakelegal-wordmark@3x.png  # 1200×480 px

web/public/brand/intakelegal-mark@1x.png      # 120×120 px
web/public/brand/intakelegal-mark@2x.png      # 240×240 px
web/public/brand/intakelegal-mark@3x.png      # 360×360 px

# Favicon
web/public/favicon.svg                         # Mark simplified for 16×16
web/public/favicon.ico                         # 16×16 and 32×32 sizes
```

**Optimization:**

Run SVGO on all SVG files:
```bash
npx svgo --precision=4 --enable=removeXMLNS --disable=removeViewBox web/public/brand/*.svg web/public/favicon.svg
```

### 7. Quality Assurance

**Before committing:**

✅ **Visual accuracy:**
```
1. Overlay exported SVG on reference at 100% zoom
2. Use difference blend mode in design tool
3. Check edge deviation: must be ≤1 px everywhere
```

✅ **Typography QA:**
```
1. Pixel-peek stems of: I, t, k, L, g
2. Check for wobble/aliasing at 100%/200% zoom
3. Re-kern if needed
```

✅ **Integration QA:**
```bash
# Start dev server
npm run dev

# Check these pages:
- http://localhost:3000 (hero logo)
- http://localhost:3000/workspace (header)
- http://localhost:3000/pricing (header)

# Verify:
- No layout shift (CLS ≤0.02)
- Logo loads instantly (priority)
- Alt text: "IntakeLegal"
- No console errors
```

✅ **Accessibility:**
```bash
# Run Lighthouse
- a11y score ≥95
- All images have alt text
- Contrast ratio ≥4.5:1 where applicable
```

---

## 🚀 After Completing Assets

### 1. Verify Integration

The code is already integrated:

- ✅ `web/lib/brand.ts` - Asset paths and colors
- ✅ `web/components/Navigation.tsx` - Logo in header (desktop + mobile)
- ✅ `web/app/layout.tsx` - Favicon references
- ✅ File structure created

### 2. Test Build

```bash
cd web
npm run build
```

Should compile with **no errors** and **CLS ≤0.02**.

### 3. Commit

```bash
git add -A
git commit -m "fix(brand): exact SVG rebuild of IntakeLegal logo; replace header assets; add favicon/og; pass visual QA

- Traced logo mark (crescent + ribbon) with ≤1px precision from reference
- Matched wordmark font [FONT NAME] with exact kerning
- Exported SVG + PNG @1x/2x/3x for all variants
- Integrated into Navigation.tsx (header) with priority loading
- Added favicon.svg + favicon.ico (16×16, 32×32)
- Updated brand.ts with asset paths and colors (#F9C051, #F7B43C)
- QA passed: visual diff ≤1px, CLS ≤0.02, a11y ≥95

Ref: Logo Rebuild v1.2 spec"
```

---

## 📁 File Checklist

**Before merge, confirm these files exist and are NOT placeholders:**

```
✅ web/public/brand/intakelegal-wordmark.svg (exact traced logo)
✅ web/public/brand/intakelegal-mark.svg (exact traced mark)
✅ web/public/brand/intakelegal-wordmark@1x.png
✅ web/public/brand/intakelegal-wordmark@2x.png
✅ web/public/brand/intakelegal-wordmark@3x.png
✅ web/public/brand/intakelegal-mark@1x.png
✅ web/public/brand/intakelegal-mark@2x.png
✅ web/public/brand/intakelegal-mark@3x.png
✅ web/public/favicon.svg (simplified mark)
✅ web/public/favicon.ico (16×16 + 32×32)
```

---

## ⚠️ Common Pitfalls

**DO NOT:**
- ❌ Use auto-trace (always manual Pen tool)
- ❌ Approximate "close enough" (must be ≤1px precision)
- ❌ Rasterize before exporting (keep vectors)
- ❌ Use transforms in SVG (flatten before export)
- ❌ Forget to optimize with SVGO
- ❌ Skip the difference blend QA step

**DO:**
- ✅ Use perfect geometric shapes (circles, arcs)
- ✅ Match kerning per letter pair, not globally
- ✅ Export at exact specified dimensions
- ✅ Test on actual devices (not just dev tools)
- ✅ Verify CLS with Lighthouse

---

## 🆘 Need Help?

If you encounter issues:

1. **Font doesn't match:** Try each candidate systematically. Adjust tracking AND per-pair kerning.
2. **Geometry off:** Re-check circle radii and arc angles. Must use perfect circles, not ellipses.
3. **Build fails:** Run `npm run build` to see specific errors. Likely SVG syntax issue.
4. **Layout shift:** Ensure explicit `width` and `height` on `<Image>` tags. Add `priority` prop.

---

## 📊 Success Criteria

Before marking complete:

- [ ] Visual diff ≤1 px (verified with difference blend)
- [ ] All stems/bowls pixel-perfect (no wobble at 200% zoom)
- [ ] Font identified or manually traced
- [ ] All 10 export files created and optimized
- [ ] Build passes without errors
- [ ] CLS ≤0.02 on all pages
- [ ] Lighthouse a11y ≥95
- [ ] Logo displays correctly on light AND dark backgrounds

---

**Current status:** Awaiting vector assets. Once complete, this branch is ready to merge to `main`.
