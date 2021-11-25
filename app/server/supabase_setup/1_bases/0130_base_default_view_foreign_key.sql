
ALTER TABLE bases ADD COLUMN default_knowledge_view_id uuid
CONSTRAINT fk_bases_default_knowledge_view REFERENCES knowledge_views(id);
