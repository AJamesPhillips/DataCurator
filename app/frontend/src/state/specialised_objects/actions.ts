import { safe_merge } from "../../utils/object"
import { highlighting_actions } from "./meta_wcomponents/highlighting"
import { selecting_actions } from "./meta_wcomponents/selecting/actions"
import { syncing_actions } from "./syncing/actions"
import { wcomponent_actions } from "./wcomponents/actions"
import { knowledge_view_actions } from "./knowledge_views/actions"
import { perception_actions } from "./perceptions/actions"
import { find_all_causal_paths_actions } from "./meta_wcomponents/find_all_causal_paths/actions"



export const specialised_object_actions = safe_merge(
    highlighting_actions,
    syncing_actions,
    selecting_actions,
    perception_actions,
    wcomponent_actions,
    knowledge_view_actions,
    find_all_causal_paths_actions,
)
