CREATE TABLE IF NOT EXISTS checklists (
 id TEXT PRIMARY KEY, location_id TEXT NOT NULL, location TEXT NOT NULL,
 date TEXT NOT NULL, time TEXT NOT NULL DEFAULT '', duration REAL, distance REAL,
 protocol TEXT, complete INTEGER, species INTEGER NOT NULL, individuals INTEGER NOT NULL,
 unknown INTEGER NOT NULL, observations TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS checklist_location_date ON checklists(location_id,date,time,id);
CREATE INDEX IF NOT EXISTS checklist_date ON checklists(date);