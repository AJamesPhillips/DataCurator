import { factory_filter_objects_by_pattern_id_c, get_object_by_id_c } from "../../state/objects/filter_objects"
import type {
    CoreObjectIdAttribute,
    CoreObjectValueAttribute,
    ObjectsState,
    ObjectWithCache,
    RootState,
} from "../../state/State"
import type { TimeSliderEvent } from "../../time_control/interfaces"
import { memoize } from "../../utils/memoize"
import type { ProjectPrioritiesMeta, ProjectPriority } from "../interfaces"



const PATTERN_PROJECT_PRIORITY = "p10"
const filter_for_project_priorities_c = factory_filter_objects_by_pattern_id_c(PATTERN_PROJECT_PRIORITY)
export const get_project_priorities_meta_c = (state: RootState): ProjectPrioritiesMeta => {

    const raw_project_priorities = filter_for_project_priorities_c(state.objects)
    const {
        project_priorities,
        project_priority_events,
        earliest_ms,
        latest_ms,
    } = get_project_priorities_c(raw_project_priorities, state.objects)

    return {
        project_priorities,
        project_priority_events,
        earliest_ms,
        latest_ms,
    }
}


const get_project_priorities_c = memoize(_get_project_priorities)

function _get_project_priorities (raw_project_priorities: ObjectWithCache[], objects: ObjectsState)
{
    // Does not need to live outside of cache as it is set to earliest due to raw_project_priorities
    // and the raw_project_priorities will bust the cache as needed
    let earliest_ms = new Date().getTime()
    let latest_ms = earliest_ms + 1

    const project_priorities: ProjectPriority[] = []
    const project_priority_events: TimeSliderEvent[] = []

    raw_project_priorities.forEach(project_priority => {
        const { attributes } = project_priority

        const start_date = new Date((attributes[1] as CoreObjectValueAttribute).value)
        const project_id = (attributes[0] as CoreObjectIdAttribute).id
        const project = get_object_by_id_c(objects, project_id)

        if (!project) return

        const start_time_ms = start_date.getTime()
        if (Number.isNaN(start_time_ms)) return

        earliest_ms = Math.min(earliest_ms, start_time_ms)
        latest_ms = Math.max(latest_ms, start_time_ms)

        const effort_value = (attributes[2] as CoreObjectValueAttribute).value

        project_priorities.push({
            start_date,
            name: (project.attributes[0] as CoreObjectValueAttribute).value,
            id: project_priority.id,
            project_id: project.id,
            fields: [{ name: "Effort", value: effort_value }]
        })

        project_priority_events.push({
            datetime: start_date,
            type: "created",
        })
    })

    return {
        project_priorities,
        project_priority_events,
        earliest_ms,
        latest_ms,
    }
}
