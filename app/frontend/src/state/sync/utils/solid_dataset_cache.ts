import type { SolidDataset } from "@inrupt/solid-client"



interface SolidDatasetCache
{
    wcomponents_dataset: SolidDataset | undefined
    knowledge_views_dataset: SolidDataset | undefined
}

export const solid_dataset_cache: SolidDatasetCache = {
    wcomponents_dataset: undefined,
    knowledge_views_dataset: undefined,
}
