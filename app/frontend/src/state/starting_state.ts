import { controls_starting_state } from "./controls/persistance"
import { get_derived_starting_state } from "./derived/starting_state"
import { display_options_starting_state } from "./display_options/persistance"
import { filter_context_starting_state } from "./filter_context/persistance"
import { get_global_keys_starting_state } from "./global_keys/state"
import { DependenciesForGettingStartingState } from "./interfaces"
import { factory_get_persisted_state_object } from "./persistence/persistence_utils"
import { view_priorities_starting_state } from "./priorities/persistance"
import { get_routing_starting_state } from "./routing/starting_state"
import { search_starting_state } from "./search/persistance"
import { get_meta_wcomponents_starting_state } from "./specialised_objects/meta_wcomponents/starting_state"
import { get_specialised_objects_starting_state } from "./specialised_objects/starting_state"
import type { RootState } from "./State"
import { sync_starting_state } from "./sync/persistance"
import { user_info_starting_state } from "./user_info/persistance"


const default_deps: DependenciesForGettingStartingState = {
    get_date: () => new Date(),
    get_url: () => window.location.toString(),
    get_url_hash: () => window.location.hash,
    get_persisted_state_object: factory_get_persisted_state_object(localStorage.getItem),
}


export function get_starting_state (deps: DependenciesForGettingStartingState = default_deps): RootState
{
    const routing = get_routing_starting_state(deps)
    const { storage_location } = routing.args
    const user_info = user_info_starting_state({ storage_location }, deps)

    const starting_state: RootState = {
        controls: controls_starting_state({ storage_location }, deps),
        filter_context: filter_context_starting_state(deps),
        specialised_objects: get_specialised_objects_starting_state(),
        last_action: undefined,
        display_options: display_options_starting_state(deps),
        sync: sync_starting_state(deps),
        routing,
        global_keys: get_global_keys_starting_state(),
        meta_wcomponents: get_meta_wcomponents_starting_state(),
        search: search_starting_state(deps),
        user_info,
        view_priorities: view_priorities_starting_state(),

        derived: get_derived_starting_state(),
    }

    return starting_state
}
