ALTER TABLE checklists ADD COLUMN taxonomy_version TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE checklists ADD COLUMN unresolved INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS checklist_history (
 revision INTEGER PRIMARY KEY AUTOINCREMENT,
 checklist_id TEXT NOT NULL,
 taxonomy_version TEXT NOT NULL,
 observations TEXT NOT NULL,
 archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER IF NOT EXISTS archive_checklist_taxonomy BEFORE UPDATE ON checklists
WHEN OLD.observations <> NEW.observations OR OLD.taxonomy_version <> NEW.taxonomy_version
BEGIN
 INSERT INTO checklist_history(checklist_id,taxonomy_version,observations)
 VALUES(OLD.id,OLD.taxonomy_version,OLD.observations);
END;
CREATE INDEX IF NOT EXISTS checklists_taxonomy_version ON checklists(taxonomy_version);