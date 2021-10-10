import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { AboutSidePanel } from "../about/AboutSidePanel"

import { CreationContextSidePanel } from "../creation_context/CreationContextSidePanel"
import { DisplayOptionsSidePanel } from "../display_options/DisplayOptionsSidePanel"
import { FiltersSidePanel } from "../filter_context/FiltersSidePanel"
import { WComponentsSidePanel } from "./wcomponents/WComponentsSidePanel"
import { ViewsSidePanel } from "../knowledge_view/ViewsSidePanel"
import { PerceptionsSidePanel } from "../perceptions/PerceptionsSidePanel"
import { SearchSidePanel } from "../search/SearchSidePanel"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { Objects } from "./Objects"
import { Patterns } from "./Patterns"
import { Statements } from "./Statements"



interface OwnProps {}


const map_state = (state: RootState) => ({
    route: state.routing.route,
    item_id: state.routing.item_id,
    presenting: state.display_options.consumption_formatting,
})


const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SidePanel (props: Props)
{
    if (props.presenting)
    {
        if (props.route === "wcomponents")
        {
            if (!props.item_id)
            {
                return <Button
                    onClick={() => props.toggle_consumption_formatting({})}
                >
                    Swap to editing
                </Button>
            }
        }
    }

    return <div>
        {props.route === "filter" && <FiltersSidePanel />}

        {props.route === "display" && <DisplayOptionsSidePanel />}

        {props.route === "statements" && <Statements />}

        {props.route === "objects" && <Objects />}

        {props.route === "patterns" && <Patterns />}

        {props.route === "creation_context" && <CreationContextSidePanel />}

        {props.route === "views" && <ViewsSidePanel />}

        {props.route === "perceptions" && <PerceptionsSidePanel />}

        {props.route === "wcomponents" && <WComponentsSidePanel />}

        {props.route === "about" && <AboutSidePanel />}

        {props.route === "search" && <SearchSidePanel />}
    </div>
}


export const SidePanel = connector(_SidePanel) as FunctionComponent<OwnProps>
