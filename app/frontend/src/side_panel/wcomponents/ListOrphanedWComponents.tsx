import { Button, ButtonGroup } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { useMemo, useState } from "preact/hooks"
import { sort_list, SortDirection } from "../../shared/utils/sort"
import { RichMarkDown } from "../../sharedf/rich_text/RichMarkDown"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import { WComponent, wcomponent_is_not_deleted } from "../../wcomponent/interfaces/SpecialisedObjects"



const map_state = (state: RootState) => ({})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _ListOrphanedWComponents (props: Props)
{
    const [orphaned_wcomponents, set_orphaned_wcomponents] = useState<undefined | WComponent[]>(undefined)

    const find_components = useMemo(() =>
    {
        return () =>
        {
            const store = get_store()
            const state = store.getState()

            const { wcomponents_by_id, knowledge_views_by_id } = state.specialised_objects

            const all_wcomponent_ids_in_knowledge_views = new Set()
            Object.values(knowledge_views_by_id)
                .forEach(kv =>
                {
                    Object.entries(kv.wc_id_map)
                        .filter(([id, entry]) => !entry.blocked && !entry.passthrough)
                        .forEach(([id, entry]) => all_wcomponent_ids_in_knowledge_views.add(id))
                })

            const orphaned_wcomponents = Object.values(wcomponents_by_id)
                .filter(wc => wcomponent_is_not_deleted(wc) && !all_wcomponent_ids_in_knowledge_views.has(wc.id))

            const sorted_orphaned_wcomponents = sort_list(orphaned_wcomponents,
                wc => (wc.modified_at || wc.created_at).getTime(),
                SortDirection.descending)

            set_orphaned_wcomponents(sorted_orphaned_wcomponents)
        }
    }, [])

    return <div>
        <h3 style={{ marginTop: 30, marginBottom: 0 }}>
            Orphaned Components
        </h3>
        <span className="description_label">
            Show all components in this project which are not in one or more knowledge views in this project.
        </span>

        <ButtonGroup fullWidth={true} color="primary" variant="contained" orientation="vertical">
            <Button onClick={() => find_components()}>
                Find orphan components
            </Button>
        </ButtonGroup>

        {orphaned_wcomponents && orphaned_wcomponents.length > 0 && <table>
        <tbody style={{ cursor: "pointer" }}>
            {orphaned_wcomponents.map(wc => <tr onClick={() => props.change_route({ item_id: wc.id })}>
                <td>{wc.type}</td>
                <td><RichMarkDown text={wc.title} /></td>
            </tr>)}
        </tbody>
        </table>}

        {orphaned_wcomponents && orphaned_wcomponents.length === 0 && <p>
            No orphaned components found.
        </p>}
    </div>
}

export const ListOrphanedWComponents = connector(_ListOrphanedWComponents) as FunctionalComponent
