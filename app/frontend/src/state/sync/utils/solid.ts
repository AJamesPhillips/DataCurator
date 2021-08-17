


const _V1 = "http://datacurator.org/schema/v1/"

export const V1 = {
    title: _V1 + "title",
    json: _V1 + "knowledge_view_json",
}


export const get_knowledge_views_url = (pod_URL: string) => `${pod_URL}/data_curator_v1/knowledge_views.ttl`
export const get_wcomponents_url = (pod_URL: string) => `${pod_URL}/data_curator_v1/world_components.ttl`
