-- CreateTable
CREATE TABLE "documents" (
    "doc_id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "original_mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("doc_id")
);
