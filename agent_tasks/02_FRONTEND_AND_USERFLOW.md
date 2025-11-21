# File 2: Frontend and User Flow

## Parent Task: UI/UX Redesign for AI Intake System

### Objective
Redesign the IntakeLegal frontend from a form builder interface to a file upload and AI summary review system with configurable firm templates.

---

## Subtasks

### 2.1 Design New Navigation Structure
**Status:** Not Started  
**Description:** Create main navigation with key sections for the AI intake workflow.

**Actions:**
- [ ] Update `web/app/layout.tsx` with new navigation
- [ ] Add navigation tabs:
  - **Workspace** (main upload/review area)
  - **Template Builder** (firm configuration)
  - **Support** (help docs)
  - **About Us** (company info)
  - **Pricing** (subscription tiers)
  - **Login** (authentication)
- [ ] Create mobile-responsive nav component
- [ ] Add user profile dropdown (when authenticated)
- [ ] Implement active route highlighting

**Navigation Component Location:**
`web/components/Navigation.tsx`

**Acceptance Criteria:**
- All tabs render correctly
- Mobile navigation works (hamburger menu)
- Active route highlighted
- Smooth transitions between pages

---

### 2.2 Build Workspace Sandbox (Anonymous Upload Demo)
**Status:** Not Started  
**Description:** Create a public demo page for single file upload without authentication.

**Actions:**
- [ ] Create `web/app/workspace/page.tsx`
- [ ] Add drag-and-drop file upload zone
- [ ] Show file type icons (.docx, .pdf, .eml, .wav, .mp3)
- [ ] Display upload progress bar
- [ ] After upload, show:
  - Extracted data preview
  - AI-generated summary
  - Clarification questions
  - Recommended next steps
- [ ] Add "Try Another File" button to reset
- [ ] Add "Sign Up to Save" CTA for anonymous users

**Demo Flow:**
1. User lands on `/workspace`
2. Drag/drop file or click to browse
3. File uploads with progress indicator
4. AI processing animation (spinner/skeleton)
5. Results display in card layout
6. Option to download PDF report

**Acceptance Criteria:**
- Anonymous users can upload one file
- All file types supported
- Results display correctly
- No data persistence (session-only for demo)

---

### 2.3 Create File Upload Component
**Status:** Not Started  
**Description:** Build reusable upload component with validation and progress tracking.

**Actions:**
- [ ] Create `web/components/FileUpload.tsx`
- [ ] Support drag-and-drop and click-to-browse
- [ ] Validate file types before upload
- [ ] Show file size and name preview
- [ ] Display upload progress (0-100%)
- [ ] Show error messages for invalid files
- [ ] Support file replacement (remove and re-upload)
- [ ] Add file type indicator icons

**Component Props:**
```typescript
interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes: string[];
  maxSizeBytes: number;
  disabled?: boolean;
}
```

**Acceptance Criteria:**
- Drag-and-drop works smoothly
- Invalid files show clear error messages
- Progress bar updates in real-time
- Component is reusable across pages

---

### 2.4 Build Summary Display Component
**Status:** Not Started  
**Description:** Create component to display AI extraction results and summaries.

**Actions:**
- [ ] Create `web/components/IntakeSummary.tsx`
- [ ] Display sections:
  - **Client Information** (name, contact, address)
  - **Case Details** (incident date, description)
  - **Area of Law** (badge with color coding)
  - **Statute of Limitations** (countdown badge)
  - **AI Summary** (formatted text with paragraphs)
  - **Clarification Questions** (numbered list)
  - **Next Steps** (checklist style)
- [ ] Add copy-to-clipboard button for summary
- [ ] Add "Export PDF" button
- [ ] Add "Edit Details" button (for authenticated users)

**Component Props:**
```typescript
interface IntakeSummaryProps {
  extractedData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    incidentDate: string;
    lawArea: string;
    description: string;
  };
  summary: string;
  clarificationQuestions: string[];
  nextSteps: string[];
  solAnalysis: {
    limitationDate: string;
    daysRemaining: number;
    urgency: "high" | "medium" | "low";
  };
}
```

**Acceptance Criteria:**
- All sections render with proper formatting
- Copy button works correctly
- Export PDF triggers download
- Mobile-responsive layout

---

### 2.5 Create Template Builder Page
**Status:** Not Started  
**Description:** Build interface for firms to configure intake templates and practice areas.

**Actions:**
- [ ] Create `web/app/template-builder/page.tsx`
- [ ] Add sections:
  - **Enabled Practice Areas** (multi-select checkboxes)
  - **Custom Fields** (add/remove input fields)
  - **Summary Template Editor** (textarea with variable hints)
  - **Questions Template Editor**
  - **Next Steps Template Editor**
- [ ] Show template preview on the right side
- [ ] Add "Save Template" button
- [ ] Show success/error toasts after save
- [ ] Protect route with authentication check

**Practice Areas:**
- Personal Injury
- Employment Law
- Medical Malpractice
- Family Law
- Immigration
- Criminal Defense
- Estate Planning

**Template Variables:**
- `{{name}}`, `{{email}}`, `{{phone}}`, `{{address}}`
- `{{incidentDate}}`, `{{lawArea}}`, `{{description}}`
- `{{limitationDate}}`, `{{daysRemaining}}`

**Acceptance Criteria:**
- Firms can enable/disable practice areas
- Custom fields can be added/removed
- Templates support variable interpolation
- Preview updates in real-time
- Templates save successfully

---

### 2.6 Build Authenticated Workspace Page
**Status:** Not Started  
**Description:** Create full workspace for authenticated users with upload history.

**Actions:**
- [ ] Create `web/app/dashboard/workspace/page.tsx`
- [ ] Show upload history table with columns:
  - Filename
  - Upload date
  - Client name (extracted)
  - Law area
  - Status (Processing | Complete | Error)
  - Actions (View | Download | Delete)
- [ ] Add "New Upload" button
- [ ] Click on row to view full summary
- [ ] Add search and filter by law area
- [ ] Add pagination (10 items per page)
- [ ] Protect route with Clerk authentication

**Acceptance Criteria:**
- Only authenticated users can access
- Upload history displays correctly
- Clicking row opens detail view
- Search and filters work
- Pagination functions properly

---

### 2.7 Create Pricing Page
**Status:** Not Started  
**Description:** Build pricing tiers page with feature comparison.

**Actions:**
- [ ] Create `web/app/pricing/page.tsx`
- [ ] Add three tiers:
  - **Free:** 5 uploads/month, basic templates
  - **Professional:** 100 uploads/month, custom templates, priority support
  - **Enterprise:** Unlimited uploads, API access, dedicated support
- [ ] Show feature comparison table
- [ ] Add "Get Started" buttons linking to sign-up
- [ ] Highlight recommended tier (Professional)
- [ ] Add FAQ section below pricing cards

**Acceptance Criteria:**
- Pricing cards are visually appealing
- Feature comparison is clear
- CTA buttons link to correct routes
- Mobile-responsive layout

---

### 2.8 Create About Us Page
**Status:** Not Started  
**Description:** Build company information and mission page.

**Actions:**
- [ ] Create `web/app/about/page.tsx`
- [ ] Add sections:
  - **Mission Statement**
  - **How It Works** (3-step process with icons)
  - **Benefits** (bullet points with icons)
  - **Team** (optional, can be placeholder)
- [ ] Use existing brand colors from `web/theme.ts`
- [ ] Add "Get Started" CTA at bottom

**Acceptance Criteria:**
- Page communicates value proposition clearly
- Visually consistent with brand
- CTA converts visitors to sign-up

---

### 2.9 Create Support/Help Page
**Status:** Not Started  
**Description:** Build help documentation and FAQs.

**Actions:**
- [ ] Create `web/app/support/page.tsx`
- [ ] Add sections:
  - **Getting Started Guide**
  - **Supported File Types**
  - **FAQ** (accordion style)
  - **Contact Support** (email/chat widget placeholder)
- [ ] Add search box for help topics
- [ ] Link to video tutorials (placeholder)

**FAQ Topics:**
- What file types are supported?
- How accurate is the AI extraction?
- Can I edit extracted information?
- How do I export summaries?
- Is my data secure?

**Acceptance Criteria:**
- Help content is clear and comprehensive
- FAQ accordion works smoothly
- Search box filters topics
- Contact options are visible

---

### 2.10 Implement Authentication Integration
**Status:** Not Started  
**Description:** Add Clerk authentication for protected routes.

**Actions:**
- [ ] Enable Clerk middleware in `web/middleware.ts`
- [ ] Protect routes:
  - `/dashboard/workspace`
  - `/template-builder`
- [ ] Create `web/app/sign-in/page.tsx` (Clerk component)
- [ ] Create `web/app/sign-up/page.tsx` (Clerk component)
- [ ] Add "Sign In" button to navigation
- [ ] Show user profile dropdown when authenticated
- [ ] Add "Sign Out" option in dropdown

**Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Acceptance Criteria:**
- Anonymous users can access `/workspace` (demo)
- Protected routes redirect to sign-in
- Sign-in/sign-up flows work correctly
- User profile displays after login

---

### 2.11 Build Upload Processing UI States
**Status:** Not Started  
**Description:** Create loading and error states for file processing.

**Actions:**
- [ ] Create `web/components/ProcessingState.tsx`
- [ ] Show states:
  - **Uploading:** Progress bar with percentage
  - **Processing:** Animated spinner with steps:
    - "Extracting text..."
    - "Analyzing content..."
    - "Generating summary..."
  - **Complete:** Success checkmark with fade-in animation
  - **Error:** Error icon with retry button
- [ ] Add estimated time remaining (if backend provides it)

**Acceptance Criteria:**
- Loading states are clear and informative
- Animations are smooth (not jarring)
- Error states show actionable messages
- Retry button works correctly

---

### 2.12 Implement PDF Export Functionality
**Status:** Not Started  
**Description:** Allow users to download summaries as PDF.

**Actions:**
- [ ] Create `web/lib/exportPdf.ts`
- [ ] Call backend endpoint `GET /api/uploads/:id/export/pdf`
- [ ] Trigger browser download with proper filename
- [ ] Show toast notification on success
- [ ] Handle errors gracefully

**Acceptance Criteria:**
- PDF downloads correctly
- Filename includes client name and date
- PDF formatting matches summary display
- Works across browsers

---

### 2.13 Add Responsive Design and Accessibility
**Status:** Not Started  
**Description:** Ensure app works on mobile and meets accessibility standards.

**Actions:**
- [ ] Test all pages on mobile viewport (375px width)
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators for form inputs
- [ ] Test with screen reader (basic check)
- [ ] Add alt text to all images/icons

**Acceptance Criteria:**
- App is fully functional on mobile
- Keyboard navigation works throughout
- Focus states are visible
- Screen reader can navigate main flow

---

## Deliverables for File 2

- [ ] New navigation with 6 tabs (Workspace, Template Builder, Support, About, Pricing, Login)
- [ ] Workspace Sandbox (anonymous demo upload)
- [ ] File upload component with drag-and-drop
- [ ] Summary display component with all sections
- [ ] Template Builder page for firm configuration
- [ ] Authenticated workspace with upload history
- [ ] Pricing page with three tiers
- [ ] About Us page
- [ ] Support page with FAQ
- [ ] Clerk authentication integration
- [ ] Processing UI states (loading, success, error)
- [ ] PDF export functionality
- [ ] Responsive design and accessibility

---

## Verification Checkpoint

Before proceeding to File 3, verify:

```bash
# 1. Web app builds successfully
npm --workspace web run build

# 2. Web app runs locally
npm --workspace web run dev

# 3. Navigate to all pages:
# - http://localhost:3000/workspace (should work without login)
# - http://localhost:3000/template-builder (should redirect to sign-in)
# - http://localhost:3000/pricing
# - http://localhost:3000/about
# - http://localhost:3000/support

# 4. Test demo upload flow:
# - Upload a test file on /workspace
# - Verify summary displays
# - Click "Export PDF"
```

**Expected Behavior:**
- All pages load without errors
- Anonymous workspace allows single upload
- Protected routes require authentication
- PDF export downloads successfully
- Mobile view is functional

---

## Pause Point

After completing all subtasks in this file, produce a summary:

**Completed:**
- List all implemented pages and components
- Confirm navigation works correctly

**Issues Encountered:**
- Document any UI/UX issues or bugs

**Recommended Fixes:**
- Suggest improvements or missing features

**Status:** ✅ READY FOR FILE 3 | ⚠️ ISSUES DETECTED | ❌ BLOCKED

Do not proceed to File 3 until this status is ✅ READY FOR FILE 3.
