-- AlterTable: Rename pricePerView to pricePer1000View
-- First, add the new column with data from old column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Campaign' AND column_name = 'pricePer1000View') THEN
        ALTER TABLE "Campaign" ADD COLUMN "pricePer1000View" DOUBLE PRECISION;
    END IF;
END $$;

-- Copy data from old column to new column (values are already per 1000 views)
UPDATE "Campaign" SET "pricePer1000View" = "pricePerView" WHERE "pricePer1000View" IS NULL;

-- Make the new column NOT NULL
ALTER TABLE "Campaign" ALTER COLUMN "pricePer1000View" SET NOT NULL;

-- Drop the old column (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Campaign' AND column_name = 'pricePerView') THEN
        ALTER TABLE "Campaign" DROP COLUMN "pricePerView";
    END IF;
END $$;

