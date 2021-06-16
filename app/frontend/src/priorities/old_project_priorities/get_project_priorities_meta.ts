import type {
    CoreObjectIdAttribute,
    CoreObjectValueAttribute,
    ObjectsState,
    ObjectWithCache,
} from "../../state/State"
import type { TimeSliderEvent } from "../../time_control/interfaces"
import type { ProjectPrioritiesMeta, ProjectPriority } from "../interfaces"
import { group_priorities_by_project, order_priorities_by_project } from "./group_and_order"
import { get_project_id_to_vertical_position } from "./vertical_position"



export function get_project_priorities_meta (raw_project_priorities: ObjectWithCache[], objects: ObjectsState): ProjectPrioritiesMeta
{
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


    const unordered_priorities_by_project = group_priorities_by_project(project_priorities)
    const priorities_by_project = order_priorities_by_project(unordered_priorities_by_project)
    const project_id_to_vertical_position = get_project_id_to_vertical_position(priorities_by_project)


    return {
        project_priorities,
        priorities_by_project,
        project_id_to_vertical_position,
        project_priority_events,
        earliest_ms,
        latest_ms,
    }
}



// TODO delete all of this once we have a map of objects by id
const get_object_by_id_c = memoize_get_object_by_id()

function memoize_get_object_by_id ()
{
    let cached_objects: ObjectsState
    let objects_by_id: { [object_id: string]: ObjectWithCache | undefined } = {}

    return (objects: ObjectsState, find_id: string) =>
    {
        if (cached_objects !== objects)
        {
            objects_by_id = {}
            objects.forEach(obj => objects_by_id[obj.id] = obj)
            cached_objects = objects
        }

        return objects_by_id[find_id]
    }
}
