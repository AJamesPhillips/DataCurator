
ALTER TABLE wcomponents
  ADD COLUMN type text NOT NULL DEFAULT '',
  ADD COLUMN attribute_id uuid NULL,
  ADD CONSTRAINT fk_wcomponents_attribute_id_wcomponents
    FOREIGN KEY(attribute_id)
    REFERENCES wcomponents(id)
;
