import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { tenantDb } from '../services/tenantDb.js';
import { getFirmIdFromRequest } from '../services/firmId.js';
import { transcribeAudio } from '../services/transcription.js';
import { extractEntities } from '../services/extraction.js';
import { generateOutput } from '../services/outputGenerator.js';
import { fileTypeFromFile } from 'file-type';
import { limitUploadsPerFirmUser } from '../middleware/rateLimit.js';
import { aiConsentGate } from '../middleware/consentGate.js';
import { audit } from '../services/audit.js';
import { errors } from '../lib/errors.js';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for supported types
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf',                                                        // .pdf
    'message/rfc822',                                                        // .eml
    'audio/wav',                                                             // .wav
    'audio/mpeg',                                                            // .mp3
    'audio/mp3',
    'application/octet-stream' // Fallback for .eml files
  ];

  const allowedExts = ['.docx', '.pdf', '.eml', '.wav', '.mp3'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed: ${allowedExts.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/uploads
 * Upload a file and process it through the AI intake pipeline
 */
router.post('/', limitUploadsPerFirmUser, upload.single('file'), aiConsentGate, async (req, res) => {
  try {
    const firmId = getFirmIdFromRequest(req);
    if (!firmId) {
      return errors.unauthorized(res, req as any, 'Firm context required');
    }
    if (!req.file) {
      return errors.badRequest(res, req as any, 'No file uploaded', { hint: 'Please provide a file in the "file" field of a multipart/form-data request' });
    }

    const db = tenantDb(firmId);

    const { filename, originalname, mimetype, size, path: filePath } = req.file;

    // Magic bytes validation using file-type (best effort)
    try {
      const detected = await fileTypeFromFile(filePath);
      const allowedExts = ['.docx', '.pdf', '.eml', '.wav', '.mp3'];
      const ext = path.extname(originalname).toLowerCase();
      const okByExt = allowedExts.includes(ext);
      const okByMagic = detected ? (
        ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/wav', 'audio/mpeg'].includes(detected.mime)
      ) : okByExt; // if unknown, fallback to extension check
      if (!okByMagic) {
        try { fs.unlinkSync(filePath); } catch {}
        return errors.unsupported(res, req as any, 'Unsupported or invalid file content');
      }
    } catch {/* ignore sniff errors, rely on ext/mime checks */}
    
    console.log(`[uploads] Processing file: ${originalname} (${mimetype}, ${size} bytes)`);

    // 1. Store upload record in database
    const uploadRecord = await db.upload.create({
      data: {
        filename: originalname,
        mimeType: mimetype,
        size,
        filePath,
        firmId, // firm association enforced
        status: 'uploaded'
      }
    });
    await audit(req as any, 'upload.created', { entityType: 'Upload', entityId: uploadRecord.id, filename: originalname, mimeType: mimetype, size });

    // 2. Extract text content based on file type
    let textContent = '';
    const ext = path.extname(originalname).toLowerCase();

    const aiAllowed = (req as any).aiAllowed !== false; // default true

    if (ext === '.wav' || ext === '.mp3') {
      // Transcribe audio files
      console.log(`[uploads] Transcribing audio file...`);
      const transcription = await transcribeAudio(filePath);
      textContent = transcription.transcript;
      
      // Update record with transcript
      await db.upload.update({
        where: { id: uploadRecord.id },
        data: {
          transcript: textContent,
          status: 'transcribed'
        }
      });
    } else {
      // Extract text from documents
      console.log(`[uploads] Extracting text from document...`);
      const extraction = await extractEntities(filePath, mimetype);
      textContent = extraction.rawText;
      
      // Update with extracted data
      await db.upload.update({
        where: { id: uploadRecord.id },
        data: {
          extractedData: extraction.entities as any,
          status: 'extracted'
        }
      });
    }

    // 3. Generate AI outputs (summary, questions, next steps)
    let finalRecord;
    if (aiAllowed) {
      console.log(`[uploads] Generating AI outputs...`);
      const output = await generateOutput(textContent, uploadRecord.id, req.body.firmId);

      // 4. Update final record
      finalRecord = await db.upload.update({
        where: { id: uploadRecord.id },
        data: {
          summary: output.summary,
          clarificationQuestions: output.clarificationQuestions as any,
          nextSteps: output.nextSteps as any,
          solAnalysis: output.solAnalysis as any,
          status: 'completed'
        }
      });
      await audit(req as any, 'upload.processed', { entityType: 'Upload', entityId: uploadRecord.id });
    } else {
      console.log(`[uploads] AI disabled by consent policy; skipping generation`);
      finalRecord = await db.upload.update({
        where: { id: uploadRecord.id },
        data: { status: 'completed', summary: 'AI processing disabled by firm policy', clarificationQuestions: [], nextSteps: [] }
      });
      await audit(req as any, 'upload.completed', { entityType: 'Upload', entityId: uploadRecord.id, aiSkipped: true });
    }

    console.log(`[uploads] Processing complete for ${originalname}`);

    // 5. Return comprehensive response
    return res.status(200).json({
      id: finalRecord.id,
      filename: finalRecord.filename,
      uploadedAt: finalRecord.createdAt,
      extractedData: finalRecord.extractedData,
      summary: finalRecord.summary,
      clarificationQuestions: finalRecord.clarificationQuestions,
      nextSteps: finalRecord.nextSteps,
      solAnalysis: finalRecord.solAnalysis,
      status: finalRecord.status
    });

  } catch (error: any) {
    console.error('[uploads] Error processing upload:', error);
    
    // Clean up file if upload record wasn't created
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('[uploads] Error cleaning up file:', cleanupError);
      }
    }

    return errors.internal(res, req as any, 'Upload processing failed', { message: error.message, details: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

/**
 * GET /api/uploads
 * List recent uploads (optional query: ?limit=50)
 */
router.get('/', async (req, res) => {
  try {
    const firmId = getFirmIdFromRequest(req);
  if (!firmId) return errors.unauthorized(res, req as any, 'Firm context required');
    const db = tenantDb(firmId);

    const limit = Math.min(Number(req.query.limit || 50), 200);

    const uploads = await db.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        filename: true,
        createdAt: true,
        status: true,
        mimeType: true
      }
    });

    return res.status(200).json({ items: uploads });
  } catch (error: any) {
    console.error('[uploads] Error listing uploads:', error);
    return errors.internal(res, req as any, 'Failed to list uploads', { message: error.message });
  }
});


/**
 * GET /api/uploads/:id
 * Retrieve upload details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getFirmIdFromRequest(req);
  if (!firmId) return errors.unauthorized(res, req as any, 'Firm context required');
    const db = tenantDb(firmId);
    
    const upload = await db.upload.findUnique({
      where: { id }
    });

    if (!upload) {
      return errors.notFound(res, req as any, 'Upload not found');
    }

    return res.status(200).json({
      id: upload.id,
      filename: upload.filename,
      uploadedAt: upload.createdAt,
      extractedData: upload.extractedData,
      summary: upload.summary,
      clarificationQuestions: upload.clarificationQuestions,
      nextSteps: upload.nextSteps,
      solAnalysis: upload.solAnalysis,
      status: upload.status
    });

  } catch (error: any) {
    console.error('[uploads] Error retrieving upload:', error);
    return errors.internal(res, req as any, 'Failed to retrieve upload', { message: error.message });
  }
});

/**
 * GET /api/uploads
 * List recent uploads (optional query: ?limit=50)
 */
router.get('/', async (req, res) => {
  try {
    const firmId = getFirmIdFromRequest(req);
    if (!firmId) return res.status(401).json({ error: 'Firm context required' });
    const db = tenantDb(firmId);

    const limit = Math.min(Number(req.query.limit || 50), 200);

    const uploads = await db.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        filename: true,
        createdAt: true,
        status: true,
        mimeType: true
      }
    });

    return res.status(200).json({ items: uploads });
  } catch (error: any) {
    console.error('[uploads] Error listing uploads:', error);
    return res.status(500).json({ error: 'Failed to list uploads', message: error.message });
  }
});

// Multer error handler for file validation errors
router.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        hint: 'Maximum file size is 10MB' 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error', 
      message: err.message 
    });
  } else if (err && err.message && err.message.includes('Unsupported file type')) {
    return errors.unsupported(res, req, 'Unsupported file type', { hint: 'Allowed file types: .docx, .pdf, .eml, .wav, .mp3' });
  }
  next(err);
});

export default router;
