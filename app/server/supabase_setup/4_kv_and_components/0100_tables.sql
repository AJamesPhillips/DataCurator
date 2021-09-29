


CREATE TABLE IF NOT EXISTS knowledge_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  short_id bigserial,
  -- limit timestamp to 3 decimal places to accommodate javascript Date object that lacks microseconds
  modified_at timestamp(3) without time zone DEFAULT now() NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_knowledge_views_base
    FOREIGN KEY(base_id)
    REFERENCES bases(id),
  CONSTRAINT knowledge_views_unique_short_ids
    UNIQUE (short_id)
);




CREATE TABLE IF NOT EXISTS wcomponents (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  short_id bigserial,
  -- limit timestamp to 3 decimal places to accommodate javascript Date object that lacks microseconds
  modified_at timestamp(3) without time zone DEFAULT now() NOT NULL,
  base_id bigint NOT NULL,
  title text NOT NULL,
  json json NOT NULL,
  CONSTRAINT fk_wcomponents_base
    FOREIGN KEY(base_id)
    REFERENCES bases(id),
  CONSTRAINT wcomponents_unique_short_ids
    UNIQUE (short_id)
);
