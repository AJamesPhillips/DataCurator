import { Button, ButtonGroup } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { selector_chosen_base_id } from "../../state/user_info/selector"
import { ACTIONS } from "../../state/actions"
import { useMemo, useState } from "preact/hooks"
import { get_store } from "../../state/store"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { RichMarkDown } from "../../sharedf/RichMarkDown"
import { SortDirection, sort_list } from "../../shared/utils/sort"



const map_state = (state: RootState) => ({})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _ListOrphanedWComponents (props: Props)
{
    const [orphaned_wcomponents, set_orphaned_wcomponents] = useState<WComponent[]>([])

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
                .filter(wc => !wc.deleted_at && !all_wcomponent_ids_in_knowledge_views.has(wc.id))

            const sorted_orphaned_wcomponents = sort_list(orphaned_wcomponents,
                wc => (wc.modified_at || wc.created_at).getTime(),
                SortDirection.descending)

            set_orphaned_wcomponents(sorted_orphaned_wcomponents)
        }
    }, [])

    return <div>
        <h3>
            List Orphaned Components
        </h3>
        <span className="description_label">
            Show all components in this base which are not part of a knowledge view in this base.
        </span>

        <ButtonGroup fullWidth={true} color="primary" variant="contained" orientation="vertical">
            <Button onClick={() => find_components()}>
                Find components
            </Button>
        </ButtonGroup>

        <table>
        <tbody style={{ cursor: "pointer" }}>
            {orphaned_wcomponents.map(wc => <tr onClick={() => props.change_route({ item_id: wc.id })}>
                <td>{wc.type}</td>
                <td><RichMarkDown text={wc.title} /></td>
            </tr>)}
        </tbody>
        </table>
    </div>
}

export const ListOrphanedWComponents = connector(_ListOrphanedWComponents) as FunctionalComponent<{}>
