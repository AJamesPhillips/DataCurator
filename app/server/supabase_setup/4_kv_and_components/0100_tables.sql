
DROP TABLE knowledge_views

CREATE TABLE IF NOT EXISTS knowledge_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  modified_at timestamp without time zone DEFAULT now()::timestamp(3) NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_knowledge_views_base
    FOREIGN KEY(base_id)
	  REFERENCES bases(id)
);




CREATE TABLE IF NOT EXISTS wcomponents (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  modified_at timestamp without time zone DEFAULT now()::timestamp(3) NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_wcomponents_base
    FOREIGN KEY(base_id)
	  REFERENCES bases(id)
);
