import type { ProjectPriorityNodeProps } from "../../canvas/interfaces"
import { x, calc_width, project_priority_y, project_priority_height } from "../../canvas/display"
import type { ProjectPrioritiesByProjectId, ProjectPriority } from "../interfaces"



interface ConvertProjectPrioritiesToNodesArgs
{
    priorities_by_project: ProjectPrioritiesByProjectId
    display_at_datetime_ms: number
}
export function convert_project_priorities_to_nodes (args: ConvertProjectPrioritiesToNodesArgs): ProjectPriorityNodeProps[]
{
    const { priorities_by_project, display_at_datetime_ms } = args

    const nodes: ProjectPriorityNodeProps[] = []

    Object.keys(priorities_by_project).forEach(project_id =>
    {
        const priorities = priorities_by_project[project_id]
        if (!priorities) return

        const { project_priorities, vertical_position } = priorities

        project_priorities.forEach(({ id, name, start_date, fields }) =>
        {
            const start_datetime_ms = start_date.getTime()

            const next_event = get_next_event(project_priorities, id)
            const max_stop_datetime_ms = next_event ? next_event.start_date.getTime() : Number.POSITIVE_INFINITY
            const stop_datetime_ms = Math.min(max_stop_datetime_ms, display_at_datetime_ms)

            const effort_field = fields.find(f => f.name === "Effort")
            const effort = effort_field ? parseFloat(effort_field.value) : 0
            const display = start_datetime_ms <= display_at_datetime_ms

            const node: ProjectPriorityNodeProps = {
                id,
                title: name,
                fields,

                x: x(start_datetime_ms),
                y: project_priority_y(vertical_position),
                width: calc_width(start_datetime_ms, stop_datetime_ms),
                height: project_priority_height,

                effort,
                display,
            }

            nodes.push(node)
        })

    })

    return nodes
}


function get_next_event (events: ProjectPriority[], project_priority_id: string): ProjectPriority | undefined
{
    const index = events.findIndex(({ id }) => id === project_priority_id)

    if (index < 0) return undefined

    return events[index + 1]
}



export function get_extent_of_content (priorities_by_project: ProjectPrioritiesByProjectId): number
{
    const number_of_project_streams = Object.keys(priorities_by_project).length
    const max_y = project_priority_y(number_of_project_streams + 1)
    return max_y
}
