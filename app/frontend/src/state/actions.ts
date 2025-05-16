import { controls_actions } from "./controls/actions"
import { display_actions } from "./display_options/actions"
import { filter_context_actions } from "./filter_context/actions"
import { global_keys_actions } from "./global_keys/actions"
import { view_priorities_actions } from "./priorities/actions"
import { routing_actions } from "./routing/actions"
import { display_at_created_datetime_actions } from "./routing/datetime/display_at_created"
import { display_at_sim_datetime_actions } from "./routing/datetime/display_at_sim_datetime"
import { search_actions } from "./search/actions_reducer"
import { specialised_object_actions } from "./specialised_objects/actions"
import { meta_wcomponents_actions } from "./specialised_objects/meta_wcomponents/actions"
import { sync_actions } from "./sync/actions"
import { user_info_actions } from "./user_info/actions"



export const ACTIONS = {
    controls: controls_actions,
    filter_context: filter_context_actions,
    display: display_actions,
    sync: sync_actions,
    routing: routing_actions,
    global_keys: global_keys_actions,
    display_at_created_datetime: display_at_created_datetime_actions,
    display_at_sim_datetime: display_at_sim_datetime_actions,
    search: search_actions,
    specialised_object: specialised_object_actions,
    meta_wcomponents: meta_wcomponents_actions,
    user_info: user_info_actions,
    view_priorities: view_priorities_actions,
}
