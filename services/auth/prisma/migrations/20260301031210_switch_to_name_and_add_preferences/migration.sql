/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - Made the column `avatar` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "avatar" SET NOT NULL;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "location" TEXT,
    "moveInDate" TIMESTAMP(3),
    "budget" INTEGER,
    "smoker" BOOLEAN NOT NULL DEFAULT false,
    "quietHours" BOOLEAN NOT NULL DEFAULT false,
    "earlyBird" BOOLEAN NOT NULL DEFAULT false,
    "nightOwl" BOOLEAN NOT NULL DEFAULT false,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "cooks" BOOLEAN NOT NULL DEFAULT false,
    "gamer" BOOLEAN NOT NULL DEFAULT false,
    "social" BOOLEAN NOT NULL DEFAULT false,
    "studious" BOOLEAN NOT NULL DEFAULT false,
    "clean" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
