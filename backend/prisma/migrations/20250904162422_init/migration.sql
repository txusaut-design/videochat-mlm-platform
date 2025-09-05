-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('MEMBERSHIP_PAYMENT', 'MLM_COMMISSION', 'WITHDRAWAL', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "public"."user." (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "wallet_address" TEXT,
    "referral_code" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "membership_expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user._pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "type" "public"."TransactionType" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "block_number" INTEGER,
    "gas_used" TEXT,
    "sender_id" TEXT,
    "receiver_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mlm_commissions" (
    "id" TEXT NOT NULL,
    "user.id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mlm_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_participants" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_participants" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user.id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "room_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" TEXT NOT NULL,
    "membership_price_usdc" TEXT NOT NULL DEFAULT '10.00',
    "membership_duration_days" INTEGER NOT NULL DEFAULT 28,
    "mlm_level_1_commission" TEXT NOT NULL DEFAULT '3.50',
    "mlm_level_2_5_commission" TEXT NOT NULL DEFAULT '1.00',
    "platform_fee_percentage" TEXT NOT NULL DEFAULT '25.00',
    "max_room_participants" INTEGER NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user._username_key" ON "public"."user."("username");

-- CreateIndex
CREATE UNIQUE INDEX "user._email_key" ON "public"."user."("email");

-- CreateIndex
CREATE UNIQUE INDEX "user._wallet_address_key" ON "public"."user."("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "user._referral_code_key" ON "public"."user."("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_hash_key" ON "public"."transactions"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "room_participants_room_id_user.id_key" ON "public"."room_participants"("room_id", "user.id");

-- AddForeignKey
ALTER TABLE "public"."user." ADD CONSTRAINT "user._referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "public"."user."("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."user."("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."user."("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mlm_commissions" ADD CONSTRAINT "mlm_commissions_user.id_fkey" FOREIGN KEY ("user.id") REFERENCES "public"."user."("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mlm_commissions" ADD CONSTRAINT "mlm_commissions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."user."("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_participants" ADD CONSTRAINT "room_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_participants" ADD CONSTRAINT "room_participants_user.id_fkey" FOREIGN KEY ("user.id") REFERENCES "public"."user."("id") ON DELETE RESTRICT ON UPDATE CASCADE;
