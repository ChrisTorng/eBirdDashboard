ALTER TABLE checklists ADD COLUMN region TEXT NOT NULL DEFAULT '';
ALTER TABLE checklists ADD COLUMN county TEXT NOT NULL DEFAULT '';
ALTER TABLE checklists ADD COLUMN lat REAL;
ALTER TABLE checklists ADD COLUMN lon REAL;
CREATE INDEX IF NOT EXISTS checklists_region ON checklists(region,date);
