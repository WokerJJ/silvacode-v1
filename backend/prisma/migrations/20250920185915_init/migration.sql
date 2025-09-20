-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "climate" JSONB,
    "cycle_days" INTEGER,
    "hacks" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gardens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gardens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."garden_crops" (
    "id" SERIAL NOT NULL,
    "garden_id" INTEGER NOT NULL,
    "crop_id" INTEGER NOT NULL,
    "sow_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planted',

    CONSTRAINT "garden_crops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "crops_name_key" ON "public"."crops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "gardens_user_id_slug_key" ON "public"."gardens"("user_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "garden_crops_garden_id_crop_id_sow_date_key" ON "public"."garden_crops"("garden_id", "crop_id", "sow_date");

-- AddForeignKey
ALTER TABLE "public"."gardens" ADD CONSTRAINT "gardens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."garden_crops" ADD CONSTRAINT "garden_crops_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."garden_crops" ADD CONSTRAINT "garden_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
