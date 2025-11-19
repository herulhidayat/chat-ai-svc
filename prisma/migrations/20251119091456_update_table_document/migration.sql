/*
  Warnings:

  - Added the required column `file_path` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "file_path" TEXT NOT NULL;
