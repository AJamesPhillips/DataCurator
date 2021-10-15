import { Box, ButtonGroup, Button } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"

import { connect, ConnectedProps } from "react-redux"
import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import { ACTIONS } from "../../state/actions"
import { get_middle_of_screen } from "../../state/display_options/display"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"



interface OwnProps { }

const map_state = (state: RootState) =>
{
    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)
    const time_origin_ms_present = (current_composed_kv && current_composed_kv.time_origin_ms) !== undefined
    const current_kv = get_current_knowledge_view_from_state(state)

    return {
        display_time_marks: state.display_options.display_time_marks,
        sim_ms: state.routing.args.sim_ms,
        time_origin_ms_present,
        current_kv,
    }
}

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
    set_display_time_marks: ACTIONS.display.set_display_time_marks,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ToggleDatetimeMarkers (props: Props)
{
    const { display_time_marks, time_origin_ms_present, current_kv } = props

    return <Box component="label">
        <ButtonGroup
            disableElevation
            variant="contained"
            value={display_time_marks}
        >
            <Button
                onClick={() =>
                {
                    const new_display_time_marks = !display_time_marks
                    if (new_display_time_marks && !time_origin_ms_present && current_kv)
                    {
                        const store = get_store()
                        const left = get_middle_of_screen(store.getState()).left
                        const new_knowledge_view: KnowledgeView = {
                            ...current_kv,
                            time_origin_ms: props.sim_ms,
                            time_origin_x: left,
                        }
                        props.upsert_knowledge_view({ knowledge_view: new_knowledge_view })
                    }
                    props.set_display_time_marks(new_display_time_marks)
                }}
                aria-label="Toggle displaying time markers"
            >
                {display_time_marks ? "Hide" : ("Show" + (time_origin_ms_present ? "" : " (Set)"))} time
            </Button>
        </ButtonGroup>
    </Box>
}

export const ToggleDatetimeMarkers = connector(_ToggleDatetimeMarkers) as FunctionalComponent<OwnProps>
