/*
  Warnings:

  - The values [INTERCITY] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('BIKE_DELIVERY', 'AUTO_RIDE', 'CAR_RIDE', 'TRUCK_DELIVERY', 'PACKERS_MOVERS');
ALTER TABLE "bookings" ALTER COLUMN "serviceType" TYPE "ServiceType_new" USING ("serviceType"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
COMMIT;
