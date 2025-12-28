-- Simple Color History Check
-- Direct query to see what's in the database

-- Check if color_history column has data
SELECT 
  name,
  surname,
  color_history
FROM players
ORDER BY surname, name;

