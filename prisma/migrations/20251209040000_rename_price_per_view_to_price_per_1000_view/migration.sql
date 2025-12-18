-- AlterTable: Rename pricePerView to pricePer1000View
-- First, add the new column with data from old column
ALTER TABLE "Campaign" ADD COLUMN "pricePer1000View" DOUBLE PRECISION;

-- Copy data from old column to new column (values are already per 1000 views)
UPDATE "Campaign" SET "pricePer1000View" = "pricePerView";

-- Make the new column NOT NULL
ALTER TABLE "Campaign" ALTER COLUMN "pricePer1000View" SET NOT NULL;

-- Drop the old column
ALTER TABLE "Campaign" DROP COLUMN "pricePerView";



