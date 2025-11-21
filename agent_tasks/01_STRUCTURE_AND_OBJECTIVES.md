# File 1: Structure and Objectives

## Parent Task: Backend Infrastructure for AI-Assisted Intake

### Objective
Transform the IntakeLegal backend from a form builder to an AI-powered intake processor that accepts file uploads, extracts structured data, and generates lawyer-ready summaries.

---

## Subtasks

### 1.1 Verify Current Monorepo Structure
**Status:** Not Started  
**Description:** Confirm the existing architecture supports the refactor.

**Actions:**
- [ ] Verify `/server`, `/web`, `/shared` structure
- [ ] List key files: `server/src/index.ts`, `server/src/routes/*`, `web/app/*`
- [ ] Confirm Prisma schema location: `server/prisma/schema.prisma`
- [ ] Check existing dependencies in `server/package.json`
- [ ] Document current routes and their purposes

**Acceptance Criteria:**
- Monorepo structure documented
- Current API routes catalogued
- Dependencies inventory created

---

### 1.2 Create `/uploads` API Route
**Status:** Not Started  
**Description:** Build a new endpoint to accept file uploads with validation.

**Actions:**
- [ ] Install `multer` for file handling: `npm --workspace server install multer @types/multer`
- [ ] Create `server/src/routes/uploads.ts`
- [ ] Support file types: `.docx`, `.pdf`, `.eml`, `.wav`, `.mp3`
- [ ] Implement file size limits (max 10MB)
- [ ] Store files temporarily in `server/uploads/` directory
- [ ] Return upload confirmation with file metadata

**API Spec:**
```typescript
POST /api/uploads
Content-Type: multipart/form-data
Body: { file: File }

Response:
{
  id: string,
  filename: string,
  mimeType: string,
  size: number,
  uploadedAt: string,
  status: "uploaded"
}
```

**Acceptance Criteria:**
- Multer configured with file validation
- Upload route returns correct metadata
- Unsupported file types rejected with 400
- Files stored in `server/uploads/`

---

### 1.3 Integrate Audio Transcription
**Status:** Not Started  
**Description:** Add Whisper API integration for audio files.

**Actions:**
- [ ] Create `server/src/services/transcription.ts`
- [ ] Use OpenAI Whisper API for `.wav`, `.mp3` transcription
- [ ] Handle audio file conversion if needed
- [ ] Return transcript text with timestamps
- [ ] Add error handling for unsupported audio formats
- [ ] Add transcript to database storage

**Service Spec:**
```typescript
export async function transcribeAudio(filePath: string): Promise<{
  transcript: string;
  duration: number;
  language: string;
}>;
```

**Acceptance Criteria:**
- Audio files successfully transcribed
- Transcript stored with upload record
- Errors logged and returned to client

---

### 1.4 Integrate LLM Entity Extraction Pipeline
**Status:** Not Started  
**Description:** Build AI pipeline to extract structured data from text/documents.

**Actions:**
- [ ] Extend `server/src/services/ai.ts` with new extraction prompt
- [ ] Create extraction schema for:
  - Client name
  - Contact info (email, phone, address)
  - Incident date
  - Limitation date (SOL)
  - Case description
  - Law area (Personal Injury, Employment, etc.)
- [ ] Parse `.docx` files using `mammoth` package
- [ ] Parse `.pdf` files using `pdf-parse` package
- [ ] Parse `.eml` files using `mailparser` package
- [ ] Send extracted text to OpenAI for structured extraction
- [ ] Validate extracted JSON against schema

**Dependencies:**
```bash
npm --workspace server install mammoth pdf-parse mailparser
```

**AI Prompt Template:**
```
Extract the following information from this legal intake document:
- Client name
- Email address
- Phone number
- Physical address
- Incident date
- Description of incident
- Area of law (Personal Injury, Employment, Medical Malpractice, etc.)

Return as JSON with these exact fields.
```

**Acceptance Criteria:**
- All file types parsed successfully
- LLM returns structured JSON
- Extracted data validated against Zod schema
- Extraction errors handled gracefully

---

### 1.5 Build Output Generator
**Status:** Not Started  
**Description:** Generate lawyer-ready summaries with clarification questions and next steps.

**Actions:**
- [ ] Create `server/src/services/outputGenerator.ts`
- [ ] Generate three outputs:
  1. **Summary:** Concise case overview (2-3 paragraphs)
  2. **Clarification Questions:** List of missing/unclear information
  3. **Next Steps:** Recommended actions for intake team
- [ ] Use GPT-4 for natural language generation
- [ ] Support configurable firm templates (see 1.7)
- [ ] Include SOL calculation from existing `server/src/services/sol.ts`

**Output Spec:**
```typescript
{
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
- Summary is coherent and professional
- Clarification questions are relevant
- Next steps are actionable
- SOL analysis integrated

---

### 1.6 Update Prisma Schema for Uploads
**Status:** Not Started  
**Description:** Add database models for file uploads and extractions.

**Actions:**
- [ ] Edit `server/prisma/schema.prisma`
- [ ] Add `Upload` model with fields:
  - `id`, `filename`, `mimeType`, `size`, `filePath`
  - `transcript` (nullable, for audio)
  - `extractedData` (JSON)
  - `firmId` (for multi-tenancy)
  - `createdAt`, `updatedAt`
- [ ] Add `FirmTemplate` model for configurable outputs:
  - `id`, `firmId`, `name`, `fields` (JSON array)
  - `summaryTemplate`, `questionsTemplate`, `stepsTemplate`
- [ ] Run migration: `npx prisma migrate dev --name add-uploads`
- [ ] Update Prisma client: `npx prisma generate`

**Schema Example:**
```prisma
model Upload {
  id            String   @id @default(cuid())
  filename      String
  mimeType      String
  size          Int
  filePath      String
  transcript    String?
  extractedData Json?
  firmId        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model FirmTemplate {
  id                 String   @id @default(cuid())
  firmId             String   @unique
  name               String
  enabledLawAreas    String[]
  customFields       Json
  summaryTemplate    String?
  questionsTemplate  String?
  stepsTemplate      String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

**Acceptance Criteria:**
- Schema updated without errors
- Migration applied successfully
- Models available in Prisma client

---

### 1.7 Implement Firm Configuration Storage
**Status:** Not Started  
**Description:** Allow firms to customize output templates and enabled practice areas.

**Actions:**
- [ ] Create `POST /api/firms/:id/templates` endpoint
- [ ] Create `GET /api/firms/:id/templates` endpoint
- [ ] Store templates in `FirmTemplate` model
- [ ] Default templates provided for new firms
- [ ] Templates use template literals for dynamic data insertion

**Default Template Example:**
```
Summary Template:
"Client {{name}} contacted us regarding a {{lawArea}} matter. 
The incident occurred on {{incidentDate}} at {{location}}. 
{{description}}"
```

**Acceptance Criteria:**
- Firms can create/update templates
- Templates support variable interpolation
- Default templates provided

---

### 1.8 Create Comprehensive API Tests
**Status:** Not Started  
**Description:** Build test script to verify all upload and extraction functionality.

**Actions:**
- [ ] Create `server/tests/uploads.test.ts`
- [ ] Test file upload with all supported types
- [ ] Test audio transcription
- [ ] Test entity extraction from each file type
- [ ] Test output generation
- [ ] Test error handling (invalid files, missing data)
- [ ] Create sample test files in `server/tests/fixtures/`

**Test Files Needed:**
- `sample.docx` (intake letter)
- `sample.pdf` (scanned document)
- `sample.eml` (email with case info)
- `sample.wav` (voice memo)

**Acceptance Criteria:**
- All tests pass with 200 responses
- Error cases return appropriate 4xx codes
- Test coverage > 80%

---

### 1.9 Update Documentation
**Status:** Not Started  
**Description:** Document new API endpoints and architecture changes.

**Actions:**
- [ ] Update `README.md` with:
  - New upload workflow diagram
  - API endpoint documentation
  - File type support matrix
  - Environment variables for OpenAI
- [ ] Create `server/API_SCHEMA.md` with:
  - Complete endpoint specs
  - Request/response examples
  - Error codes and messages
- [ ] Update `.env.example` with new variables

**Acceptance Criteria:**
- README reflects new architecture
- API schema is complete and accurate
- Environment variables documented

---

## Deliverables for File 1

- [ ] `/api/uploads` route accepting `.docx`, `.pdf`, `.eml`, `.wav`, `.mp3`
- [ ] Transcription service for audio files
- [ ] Entity extraction pipeline returning structured JSON
- [ ] Output generator producing summaries, questions, next steps
- [ ] Updated Prisma schema with `Upload` and `FirmTemplate` models
- [ ] Firm template configuration endpoints
- [ ] Comprehensive test suite
- [ ] Updated README and API_SCHEMA.md

---

## Verification Checkpoint

Before proceeding to File 2, verify:

```bash
# 1. Server builds successfully
npm --workspace server run build

# 2. Health endpoint responds
curl http://localhost:4000/health

# 3. Upload endpoint exists
curl -X POST http://localhost:4000/api/uploads \
  -F "file=@server/tests/fixtures/sample.docx"

# 4. Response includes extracted data
# Should return: { id, filename, extractedData: {...}, summary, questions, nextSteps }
```

**Expected Output:**
```json
{
  "id": "clx...",
  "filename": "sample.docx",
  "extractedData": {
    "name": "John Doe",
    "email": "john@example.com",
    "incidentDate": "2024-01-15",
    "lawArea": "Personal Injury",
    "description": "..."
  },
  "summary": "Client John Doe contacted us regarding...",
  "clarificationQuestions": ["What was the extent of injuries?", ...],
  "nextSteps": ["Schedule intake call", "Request medical records", ...]
}
```

---

## Pause Point

After completing all subtasks in this file, produce a summary:

**Completed:**
- List all implemented features
- Confirm all tests pass

**Issues Encountered:**
- Document any blockers or workarounds

**Recommended Fixes:**
- Suggest improvements or optimizations

**Status:** ✅ READY FOR FILE 2 | ⚠️ ISSUES DETECTED | ❌ BLOCKED

Do not proceed to File 2 until this status is ✅ READY FOR FILE 2.
