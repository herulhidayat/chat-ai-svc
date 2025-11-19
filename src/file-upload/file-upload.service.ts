import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationService } from 'src/common/validation.services';
import { FileUploadValidation } from './file-upload.validation';
import { ZodError } from 'zod';
import { ExtractorService } from 'src/common/extractor.service';
import { EmbedderService } from 'src/common/embedder.service';
import { ChromaService } from 'src/chroma/chroma.service';
import { DocumentUploadedResponse } from 'src/model/document.model';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly validationService: ValidationService,
        private extractorService: ExtractorService,
        private embedderService: EmbedderService,
        private chromaService: ChromaService,
        private prismaService: PrismaService
    ) {}

    async handleUploadFile(file: Express.Multer.File): Promise<DocumentUploadedResponse> {
        try {
            const { file: validatedFile } = this.validationService.validate(
                FileUploadValidation.UPLOAD,
                { file }
            );

            const textFileExtraction = await this.extractorService.extractText(
                file
            )

            const docId = this.buildCollectionName(file.filename);

            const embeddedText = await this.embedderService.embedBatch(
                textFileExtraction,
                'http://10.12.120.32:8142/v1/embeddings',
                docId
            );

            const embeddings = embeddedText.data.map(({ embedding }) => embedding);
            const chunks = embeddedText.data.map(({ id, text }) => ({
                id,
                text,
            }));

            
            if (embeddings.length > 0 && embeddedText.metaData?.doc_id) {
                await this.chromaService.addEmbeddings(
                    embeddedText.metaData.doc_id,
                    embeddings,
                    chunks
                );
            }

            const documentMetadata = await this.prismaService.document.create({
                data: {
                    doc_id: docId,
                    name: file.filename,
                    original_mime_type: file.mimetype,
                    size: file.size,
                    uploaded_at: new Date(),
                    file_path: validatedFile.path
                },
            })

            return {
                docId: documentMetadata.doc_id,
                message: 'File uploaded successfully',
                filePath: documentMetadata.file_path,
            };
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(
                    error.issues[0]?.message ?? 'File upload validation failed.'
                );
            }

            throw error;
        }
    }

    private buildCollectionName(rawName: string): string {
        const replaced = rawName
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9._-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^[^a-zA-Z0-9]+/, '')
            .replace(/[^a-zA-Z0-9]+$/, '');

        let result = replaced || `doc-${Date.now()}`;
        if (result.length < 3) {
            result = result.padEnd(3, '0');
        }
        if (result.length > 512) {
            result = result.slice(0, 512);
        }
        if (!/^[a-zA-Z0-9]/.test(result)) {
            result = `d${result}`;
        }
        if (!/[a-zA-Z0-9]$/.test(result)) {
            result = `${result}0`;
        }

        return result;
    }
}
