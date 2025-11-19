import { Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import { DOMMatrix as CanvasDOMMatrix, Path2D as CanvasPath2D, ImageData as CanvasImageData } from '@napi-rs/canvas';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

const globalCanvas = globalThis as Record<string, unknown>;

if (typeof globalCanvas.DOMMatrix === 'undefined') {
    globalCanvas.DOMMatrix = CanvasDOMMatrix;
}

if (typeof globalCanvas.Path2D === 'undefined') {
    globalCanvas.Path2D = CanvasPath2D;
}

if (typeof globalCanvas.ImageData === 'undefined') {
    globalCanvas.ImageData = CanvasImageData;
}

type ProcessWithGetBuiltin = NodeJS.Process & {
    getBuiltinModule?: (name: string) => unknown;
};

const localRequire = createRequire(__filename);
const nodeProcess = process as ProcessWithGetBuiltin;

if (typeof nodeProcess.getBuiltinModule !== 'function') {
    nodeProcess.getBuiltinModule = (moduleName: string) => {
        try {
            return localRequire(moduleName);
        } catch {
            return undefined;
        }
    };
}

// Lazily load the Node-friendly legacy pdfjs-dist build when text extraction is requested.
let pdfjsPromise: Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> | null = null;

const loadPdfjs = async () => {
    if (!pdfjsPromise) {
        pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
    }

    return pdfjsPromise;
};

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => 'str' in item;

@Injectable()
export class ExtractorService {
    async extractText(file: Express.Multer.File): Promise<string[]> {
        if(!file) {
            return [];
        }

        const fileData = await this.readFileData(file);
        if (!fileData) {
            return [];
        }

        const pdfjs = await loadPdfjs();
        const pdf = await pdfjs.getDocument({ data: fileData }).promise;

        const fullText: string[] = []; // this will be split every 500-1000 characters
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const str = textContent.items
                .filter(isTextItem)
                .map((item) => item.str)
                .join('');
            fullText.push(str);
        }

        return fullText;
    }

    private async readFileData(file: Express.Multer.File): Promise<Uint8Array | null> {
        if (file.buffer?.length) {
            return new Uint8Array(file.buffer);
        }

        if (file.path) {
            try {
                const data = await fs.readFile(file.path);
                return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
            } catch (error) {
                console.error('Failed to read uploaded file', error);
            }
        }

        return null;
    }
}
