import { FunctionComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AboutSidePanel } from "../about/AboutSidePanel"
import { CreationContextSidePanel } from "../creation_context/CreationContextSidePanel"
import { DisplayOptionsSidePanel } from "../display_options/DisplayOptionsSidePanel"
import { FiltersSidePanel } from "../filter_context/FiltersSidePanel"
import { ViewsSidePanel } from "../knowledge_view/ViewsSidePanel"
import { SearchSidePanel } from "../search/SearchSidePanel"
import { SelectionControlSidePanel } from "../selection_control/SelectionControlSidePanel"
import type { RootState } from "../state/State"
import "./SidePanel.scss"
import { WComponentsSidePanel } from "./wcomponents/WComponentsSidePanel"



interface OwnProps {}


const map_state = (state: RootState) => ({
    route: state.routing.route,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SidePanel (props: Props)
{

    return <div>
        {props.route === "filter" && <FiltersSidePanel />}

        {props.route === "select" && <SelectionControlSidePanel />}

        {props.route === "display" && <DisplayOptionsSidePanel />}

        {props.route === "creation_context" && <CreationContextSidePanel />}

        {props.route === "views" && <ViewsSidePanel />}

        {props.route === "wcomponents" && <WComponentsSidePanel />}

        {props.route === "about" && <AboutSidePanel />}

        {props.route === "search" && <SearchSidePanel />}
    </div>
}


export const SidePanel = connector(_SidePanel) as FunctionComponent<OwnProps>
