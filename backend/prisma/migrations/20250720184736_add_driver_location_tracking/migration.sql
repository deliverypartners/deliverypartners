-- AlterTable
ALTER TABLE "driver_profiles" ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "currentLatitude" DOUBLE PRECISION,
ADD COLUMN     "currentLongitude" DOUBLE PRECISION,
ADD COLUMN     "lastLocationUpdate" TIMESTAMP(3);
