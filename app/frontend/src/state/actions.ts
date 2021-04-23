import { display_at_created_datetime_actions } from "./datetime/display_at_created"
import { display_actions } from "./display/actions"
import { global_keys_actions } from "./global_keys/actions"
import { objectives_actions } from "./objectives"
import { object_actions } from "./objects/actions"
import { pattern_actions } from "./pattern_actions"
import { routing_actions } from "./routing/actions"
import { specialised_object_actions } from "./specialised_objects/actions"
import { statement_actions } from "./statements"
import { sync_actions } from "./sync"



export const ACTIONS = {
    display: display_actions,
    pattern: pattern_actions,
    statement: statement_actions,
    object: object_actions,
    sync: sync_actions,
    routing: routing_actions,
    global_keys: global_keys_actions,
    display_at_created_datetime: display_at_created_datetime_actions,
    objectives: objectives_actions,
    specialised_object: specialised_object_actions,
}
