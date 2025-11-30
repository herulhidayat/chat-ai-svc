-- CreateTable
CREATE TABLE "chat_history" (
    "session_id" VARCHAR(100) NOT NULL,
    "history_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("session_id")
);
