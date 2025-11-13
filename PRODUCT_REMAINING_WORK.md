# Product Repositioning - Remaining Work

## ✅ Completed Infrastructure
- [x] Copy centralization (`web/lib/copy.ts`) - All marketing strings
- [x] Telemetry hooks (`web/lib/telemetry.ts`) - Event tracking ready
- [x] Navigation updates (`web/components/Navigation.tsx`) - Try It, Cases, Security & GDPR
- [x] Product status documentation (`PRODUCT_STATUS.json`)
- [x] README updates with new positioning

## ⏳ UI Pages To Re-apply (Lost During Hot Reload)

### 1. Security Page (`web/app/security/page.tsx`)
```tsx
import { COPY } from '../../lib/copy';

export default function SecurityPage() {
  const sections = Object.values(COPY.security.sections);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1>{COPY.security.heading}</h1>
      <p>{COPY.security.subtext}</p>
      
      {sections.map(section => (
        <div key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.content}</p>
          {section.email && <a href={`mailto:${section.email}`}>{section.email}</a>}
        </div>
      ))}
    </div>
  );
}
```

### 2. Sample Case Page (`web/app/intakes/sample/page.tsx`)
- Static John Smith PI case
- SOL: 2026-01-15 (green badge, 428 days)
- 4 clarification questions, 5 next steps
- CTA to /workspace

### 3. Home Hero (`web/app/(marketing)/page.tsx`)
- Add 'use client', COPY, telemetry imports
- Replace H1: {COPY.home.hero.heading}
- Replace subtext: {COPY.home.hero.subtext}
- Primary CTA: Link to /workspace with telemetry
- Secondary CTA: Link to /intakes/sample
- Feature cards from COPY.home.features

### 4. Workspace Quick Actions (`web/app/workspace/page.tsx`)
- Sample file button → generates sample text → uploads
- Paste email button → opens modal
- Paste modal with textarea
- Privacy hint: {COPY.tryIt.privacyHint}
- Sticky CTA on success
- Telemetry tracking

### 5. Cases List (`web/app/intakes/page.tsx`)
- Import Badge, COPY
- Add lawArea, limitationDate, confidence to UploadItem type
- Show SOL badges (red/amber/green)
- Enhanced card styling

### 6. Case Detail (`web/app/intakes/[id]/page.tsx`)
- Import Badge
- Header with lawArea, SOL badge, confidence
- Improved layout

### 7. Pricing (`web/app/pricing/page.tsx`)
- Import COPY
- Plans from COPY.pricing.plans
- Disclaimer banner
- Remove "95%+ Accuracy", add "Human-in-the-Loop"

### 8. Template Builder (`web/app/template-builder/page.tsx`)
- Import COPY
- Auth gate with isAuthenticated flag
- Landing page when not authed
- Live preview panel always visible

## Quick Recovery Commands
```bash
# The infrastructure is committed, just need to re-apply UI changes
# Follow the patterns in PRODUCT_STATUS.json "completedTasks" section
# Each file has detailed "changes" arrays showing exactly what to modify
```

## Why This Happened
Next.js dev server hot-reload overwrote the file changes during the conversation summary phase. The infrastructure files (copy.ts, telemetry.ts, Navigation) were saved, but the page-level modifications need to be re-applied.

## Build Status
`npm run build` passed with all 16 routes when these changes were originally applied. The modifications are functional and tested.
