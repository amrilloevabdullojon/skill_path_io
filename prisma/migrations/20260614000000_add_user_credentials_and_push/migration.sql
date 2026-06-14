-- Auth credentials on User (bcrypt password + email verification timestamp).
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- Expo push tokens registered per user.
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'expo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- Expo push receipts awaiting async confirmation (polled via /getReceipts).
CREATE TABLE "PushReceipt" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

CREATE INDEX "PushReceipt_createdAt_idx" ON "PushReceipt"("createdAt");

ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
