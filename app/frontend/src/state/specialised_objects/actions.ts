import { safe_merge } from "../../utils/object"
import { highlighting_actions } from "./meta_wcomponents/highlighting"
import { syncing_actions } from "./syncing/actions"
import { wcomponent_actions } from "./wcomponents/actions"
import { knowledge_view_actions } from "./knowledge_views/actions"



export const specialised_object_actions = safe_merge(
    highlighting_actions,
    syncing_actions,
    wcomponent_actions,
    knowledge_view_actions,
)
