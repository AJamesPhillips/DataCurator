


CREATE TABLE IF NOT EXISTS knowledge_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  modified_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_knowledge_views_base
    FOREIGN KEY(base_id)
	  REFERENCES bases(id)
);




CREATE TABLE IF NOT EXISTS wcomponents (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  modified_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_wcomponents_base
    FOREIGN KEY(base_id)
	  REFERENCES bases(id)
);
