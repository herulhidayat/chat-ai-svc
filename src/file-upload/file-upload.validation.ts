import { Express } from 'express';
import { z, ZodType } from 'zod';

export type FileUploadRequest = {
  file: Express.Multer.File;
};

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument',
  'text/csv',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileUploadValidation {
  static readonly UPLOAD: ZodType<FileUploadRequest> = z.object({
    file: z
      .custom<Express.Multer.File>((file) => !!file, {
        message: 'No file uploaded',
      })
      .refine((file) => !!file && ALLOWED_MIME_TYPES.includes(file.mimetype), {
        message: 'Invalid file type. Only PDF, DOCX, and CSV files are allowed.',
      })
      .refine((file) => !!file && file.size <= MAX_FILE_SIZE, {
        message: 'File size exceeds the maximum limit of 5MB.',
      }),
  });
}
