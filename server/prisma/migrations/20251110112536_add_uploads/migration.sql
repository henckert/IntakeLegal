-- CreateTable
CREATE TABLE "FormInstance" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "themeJSON" JSONB,
    "retentionPolicy" TEXT,
    "schemaJSON" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "contactJSON" JSONB NOT NULL,
    "narrative" TEXT NOT NULL,
    "eventDatesJSON" TEXT[],
    "consent" BOOLEAN NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "aiClassification" TEXT NOT NULL,
    "aiFollowUps" JSONB NOT NULL,
    "solExpiryDate" TIMESTAMP(3),
    "solDaysRemaining" INTEGER,
    "solBadge" TEXT,
    "solBasis" TEXT,
    "solDisclaimer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "transcript" TEXT,
    "extractedData" JSONB,
    "summary" TEXT,
    "clarificationQuestions" JSONB,
    "nextSteps" JSONB,
    "solAnalysis" JSONB,
    "firmId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmTemplate" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabledLawAreas" TEXT[],
    "customFields" JSONB NOT NULL,
    "summaryTemplate" TEXT,
    "questionsTemplate" TEXT,
    "stepsTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormInstance_slug_key" ON "FormInstance"("slug");

-- CreateIndex
CREATE INDEX "Intake_slug_idx" ON "Intake"("slug");

-- CreateIndex
CREATE INDEX "Intake_createdAt_idx" ON "Intake"("createdAt");

-- CreateIndex
CREATE INDEX "Upload_firmId_idx" ON "Upload"("firmId");

-- CreateIndex
CREATE INDEX "Upload_createdAt_idx" ON "Upload"("createdAt");

-- CreateIndex
CREATE INDEX "Upload_status_idx" ON "Upload"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FirmTemplate_firmId_key" ON "FirmTemplate"("firmId");

-- CreateIndex
CREATE INDEX "FirmTemplate_firmId_idx" ON "FirmTemplate"("firmId");

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
