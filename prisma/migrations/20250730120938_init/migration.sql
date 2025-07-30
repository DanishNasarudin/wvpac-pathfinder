-- CreateTable
CREATE TABLE "public"."Floor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "src" TEXT NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floorId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Point" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "floorId" INTEGER NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Edge" (
    "id" SERIAL NOT NULL,
    "floorId" INTEGER NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;
