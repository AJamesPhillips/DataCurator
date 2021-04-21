import type { ProjectIdToVerticalPosition, ProjectPrioritiesByProjectId } from "../interfaces"


export function get_project_id_to_vertical_position (priorities_by_project: ProjectPrioritiesByProjectId): ProjectIdToVerticalPosition
{
    const map: ProjectIdToVerticalPosition = {}

    Object.keys(priorities_by_project).forEach(project_id =>
    {
        map[project_id] = priorities_by_project[project_id].vertical_position
    })

    return map
}
