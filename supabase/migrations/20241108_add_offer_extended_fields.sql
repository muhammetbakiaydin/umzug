-- Add new fields to offers table for enhanced features
-- This migration adds: trailer, sprinter, floor numbers, object type, room count

ALTER TABLE offers
ADD COLUMN IF NOT EXISTS has_trailer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_sprinter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS from_floor INTEGER,
ADD COLUMN IF NOT EXISTS to_floor INTEGER,
ADD COLUMN IF NOT EXISTS object_type TEXT DEFAULT 'Wohnung' CHECK (object_type IN ('Haus', 'Wohnung')),
ADD COLUMN IF NOT EXISTS room_count INTEGER DEFAULT 3 CHECK (room_count >= 1 AND room_count <= 10);

-- Update existing offers with default values
UPDATE offers 
SET 
  has_trailer = COALESCE(has_trailer, false),
  has_sprinter = COALESCE(has_sprinter, false),
  object_type = COALESCE(object_type, 'Wohnung'),
  room_count = COALESCE(room_count, 3)
WHERE has_trailer IS NULL OR has_sprinter IS NULL OR object_type IS NULL OR room_count IS NULL;
