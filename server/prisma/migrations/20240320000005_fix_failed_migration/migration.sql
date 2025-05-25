-- This migration fixes the failed state by marking the initial migration as applied
-- It doesn't create any tables since they already exist
SELECT 1; 