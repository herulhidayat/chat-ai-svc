-- CreateTable
CREATE TABLE "chat_history" (
    "sessionId" VARCHAR(100) NOT NULL,
    "historyName" VARCHAR(100) NOT NULL,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("sessionId")
);
