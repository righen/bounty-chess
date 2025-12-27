-- Add missing player fields
ALTER TABLE players ADD COLUMN payment_proof TEXT;
ALTER TABLE players ADD COLUMN transfer_name TEXT;
