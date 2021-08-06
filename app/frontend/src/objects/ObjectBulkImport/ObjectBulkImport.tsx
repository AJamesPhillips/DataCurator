import { Component, ComponentClass, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { CoreObject, RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { LinkButton } from "../../sharedf/Link"
import { get_data_from_air_table, replace_temp_ids, temp_id_factory } from "./get_data_from_air_table"
import { PATTERN_ID_ACTION_V2, PATTERN_ID_PRIORITY, PATTERN_ID_EVENT } from "./common"



interface OwnProps {}


const map_state = (state: RootState) => {
    const pattern_action = state.patterns.find(({ id }) => id === PATTERN_ID_ACTION_V2)
    const pattern_priority = state.patterns.find(({ id }) => id === PATTERN_ID_PRIORITY)
    const pattern_event = state.patterns.find(({ id }) => id === PATTERN_ID_EVENT)

    const ready = state.sync.ready
    if (!pattern_action && ready) throw new Error(`Pattern "Action v2" for id: ${PATTERN_ID_ACTION_V2} not found`)
    if (!pattern_priority && ready) throw new Error(`Pattern "Priority" for id: ${PATTERN_ID_PRIORITY} not found`)
    if (!pattern_event && ready) throw new Error(`Pattern "Event" for id: ${PATTERN_ID_EVENT} not found`)

    return {
        existing_objects: state.objects,
        patterns_available: !!pattern_action && !!pattern_event,
        patterns: {
            action: pattern_action,
            priority: pattern_priority,
            event: pattern_event,
        },
    }
}


const map_dispatch = {
    upsert_objects: ACTIONS.object.upsert_objects,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


class _ObjectBulkImport extends Component<Props, {statuses: string[]}>
{
    constructor (props: Props)
    {
        super(props)
        this.state = { statuses: [] }
    }


    render ()
    {
        const add_status = (status: string) => this.setState({ statuses: [...this.state.statuses, status] })
        const set_statuses = (statuses: string[]) => this.setState({ statuses })

        const on_new_objects = (object_type: string, objects: CoreObject[], error: string) =>
        {
            if (error)
            {
                add_status(error)
                return
            }

            add_status(`Successfully fetched ${objects.length} ${object_type} objects`)

            this.props.upsert_objects({ objects })
        }


        const get_data = async () =>
        {
            if (!this.props.patterns_available)
            {
                set_statuses(["Can not fetch objects from AirTable API, patterns not available"])
                setTimeout(() => set_statuses([]), 5000)
                return
            }

            const { patterns, existing_objects } = this.props
            const { temporary_ids_map, get_temp_id } = temp_id_factory()

            set_statuses(["Fetching objects from AirTable API", ""])
            const actions_result = await get_data_from_air_table(patterns.action!, existing_objects, get_temp_id)
            const priorities_result = await get_data_from_air_table(patterns.priority!, existing_objects, get_temp_id)
            // const events_result = await get_data_from_air_table(patterns.event!, existing_objects, get_temp_id)

            const objects_with_temp_ids = [
                ...actions_result.objects_with_temp_ids,
                ...priorities_result.objects_with_temp_ids,
                // ...events_result.objects_with_temp_ids,
            ]

            const objects: CoreObject[] = replace_temp_ids({
                objects_with_temp_ids,
                existing_objects,
                temporary_ids_map,
            })

            on_new_objects("of all types of", objects, actions_result.error)

            setTimeout(() => set_statuses([]), 5000)
        }


        let { statuses } = this.state
        if (statuses.length) statuses = ["Status:", ...statuses]


        return <div>
            <b>Object Bulk Import</b>

            <LinkButton
                route="objects"
                sub_route="objects_bulk_import/setup"
                item_id={undefined}
                args={undefined}
                name="Bulk import setup"
                style={{ float: "right" }}
            />

            <br /><br />

            <hr />

            <b>Get AirTable data</b>

            <br /><br />

            <input
                type="button"
                value={this.props.patterns_available ? "Get data" : "(Patterns not available)"}
                onClick={get_data}
                disabled={!!statuses.length || !this.props.patterns_available}
            ></input>

            <br />

            {statuses.map((status, i) => <div key={status + i}><b>{status}</b><br /></div>) }

        </div>
    }
}


export const ObjectBulkImport = connector(_ObjectBulkImport) as ComponentClass<OwnProps>
