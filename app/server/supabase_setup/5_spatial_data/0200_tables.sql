


-- CREATE TABLE IF NOT EXISTS spatial_data_set (
--   id SERIAL PRIMARY KEY,
--   component_id uuid,  -> wcomponent.id nullable
--   description text NOT NULL,
--   external_source_id uuid,  -> wcomponent.id nullable
--   author_id uuid,
--   created_at datetime
--   valid_at datetime nullable
--   valid_from datetime nullable
--   valid_to datetime nullable
--   (temporal_resolution_s) number nullable
--   space uuid -> spatial_data_set.id nullable
--   (spatial_resolution_m) number nullable
--   (base_id) (uuid)

--   -- id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
--   -- short_id bigserial,
--   -- -- limit timestamp to 3 decimal places to accommodate javascript Date object that lacks microseconds
--   -- modified_at timestamp(3) without time zone DEFAULT now() NOT NULL,
--   -- base_id bigint NOT NULL,

--   -- json json NOT NULL,
--   -- CONSTRAINT fk_knowledge_views_base
--   --   FOREIGN KEY(base_id)
--   --   REFERENCES bases(id),
--   -- CONSTRAINT knowledge_views_unique_short_ids
--   --   UNIQUE (short_id)
-- );
