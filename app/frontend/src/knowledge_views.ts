// const { v4: uuid_v4 } = require("uuid")

import type { KnowledgeView } from "./shared/interfaces/knowledge_view"
import { parse_knowledge_view } from "./wcomponent/parse_json/parse_knowledge_view"



// const wcomponent_ids = [
//    {"old_id":"wc123","new_id":"7abc...8"},
//    ... etc
// ]



export const knowledge_views: KnowledgeView[] = [
    // knowledge_views objects here...
    // {id: "1234...8", ...},
    // ... etc
].map(kv =>
{
    const ok_kv: KnowledgeView = parse_knowledge_view({
        ...kv,
        base_id: 13,
    } as any)

    return ok_kv
})


// wcomponent_ids.forEach(ids =>
// {
//     const regexp = new RegExp(ids.old_id, "g")

//     knowledge_views.forEach((kv_str, index) =>
//     {
//         const new_kv_str = kv_str.replace(regexp, ids.new_id)
//         knowledge_views[index] = new_kv_str
//     })
// })



// const knowledge_view_ids = knowledge_views.map((kv_str, index) =>
// {
//     const new_id = uuid_v4()
//     const kv = JSON.parse(kv_str)
//     const old_id = kv.id

//     const new_description = (kv.description || "") + `\n\n(Old id: ${old_id})`
//     const new_kv = { ...kv, description: new_description }
//     const new_kv_str = JSON.stringify(new_kv)
//     knowledge_views[index] = new_kv_str

//     return { old_id, new_id }
// })
// // we have some old ids like kv1, kv2 etc which are causing problems if used first
// .sort((a, b) => a.old_id.length > b.old_id.length ? -1 : 1)



// knowledge_view_ids.forEach(ids =>
// {
//     const regexp = new RegExp(ids.old_id, "g")

//     knowledge_views.forEach((kv_str, index) =>
//     {
//         const new_kv_str = kv_str.replace(regexp, ids.new_id)
//         knowledge_views[index] = new_kv_str
//     })
// })

// console.log(knowledge_views.join(",\n"))
