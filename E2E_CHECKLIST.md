# E2E Testing Checklist

## Pre-Test Setup

- [x] Playwright installed (`npm install --save-dev @playwright/test`)
- [x] Chromium browser installed (`npx playwright install chromium`)
- [x] Test fixtures created (`tests/fixtures/sample-intake.txt`)
- [x] E2E runner script created (`scripts/e2e-runner.mjs`)
- [x] Package.json scripts added (`test:e2e`, `ci:e2e`)

## Test Suites

### Upload Tests (`upload-docx.spec.ts`)
- [x] Test file upload with .txt file
- [x] Verify "Processing Your File" loading state appears
- [x] Verify AI Summary section appears after processing (45s timeout)
- [x] Verify Extracted Information section is visible
- [x] Verify "Try Another File" button is present
- [x] Test error handling for unsupported file types

### Navigation Tests (`upload-wav.spec.ts`)
- [x] Verify workspace page loads correctly
- [x] Verify file upload input is visible
- [x] Verify "Demo Mode" info banner is present
- [x] Navigate to intakes list page
- [x] Verify intakes page shows loading/empty/error state

## Manual Test Scenarios

### Upload Flow (with DATABASE_URL set)
1. Start servers: `npm run dev:both`
2. Navigate to: http://localhost:3000/workspace
3. Upload `tests/fixtures/sample-intake.txt`
4. Verify:
   - [ ] Loading spinner appears
   - [ ] Processing messages appear
   - [ ] AI summary is generated
   - [ ] Extracted entities are displayed
   - [ ] Clarification questions are shown
   - [ ] Next steps are provided
   - [ ] SOL analysis with badge is visible
   - [ ] "Try Another File" button works

### Intakes List
1. Navigate to: http://localhost:3000/intakes
2. Verify:
   - [ ] List shows uploaded files
   - [ ] Each item shows filename, date, status, mime type
   - [ ] "View" link navigates to detail page
   - [ ] Empty state shows "No intakes yet" when no data

### Intake Detail
1. Click "View" on any intake from the list
2. Navigate to: http://localhost:3000/intakes/[id]
3. Verify:
   - [ ] Filename and upload date are shown
   - [ ] Status is displayed
   - [ ] AI Summary section shows generated text
   - [ ] Extracted Data JSON is visible
   - [ ] Clarification Questions are displayed
   - [ ] Next Steps are shown
   - [ ] "Back" button returns to list

### Error Handling
1. Upload unsupported file type (.exe, .zip, etc.)
   - [ ] Error toast shows "Unsupported file type" (415)
   - [ ] Hint message shows allowed types
2. Upload file larger than 10MB
   - [ ] Error shows "File too large" (400)
   - [ ] Hint message shows size limit
3. Upload too many files (rate limit)
   - [ ] Error shows "Too many uploads" (429)
4. Server offline
   - [ ] Error shows connection failure
   - [ ] Graceful error message displayed

## Automated Test Execution

### Local Run
```bash
# Start servers manually
npm run dev:both

# Run tests (separate terminal)
npm run test:e2e
```

### CI Run (Automated Start/Stop)
```bash
# Starts servers, runs tests, cleans up
npm run ci:e2e
```

## Test Results

### Last Run: [Date]
- **Environment**: Local development
- **Database**: Not configured (mock data)
- **All Tests**: ❓ PENDING
- **Exit Code**: ❓

### Outcomes
- [ ] `upload-docx.spec.ts`: PASS / FAIL / SKIP
- [ ] `upload-wav.spec.ts`: PASS / FAIL / SKIP

### Issues Found
- None

### Notes
- Tests run without DATABASE_URL use mock/503 responses
- Upload processing requires OPENAI_API_KEY for real AI summaries
- Without API key, deterministic mock data is returned

## Dependencies Check

```bash
# Verify installations
npx playwright --version
node --version
npm --version
```

## Next Steps
1. Run `npm run ci:e2e` to execute all tests
2. Fix any failing tests
3. Update this checklist with results
4. Commit passing tests before merge to main

---

**Status**: Tests created, ready for execution
**Last Updated**: 2025-11-10
