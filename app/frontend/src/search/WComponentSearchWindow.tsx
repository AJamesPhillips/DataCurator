import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { SearchWindow } from "./SearchWindow"



interface OwnProps
{
    on_change: (option_id: string | undefined) => void
    on_blur: () => void
}


const map_state = (state: RootState) => ({
    wcomponents: state.specialised_objects.wcomponents,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentSearchWindow (props: Props)
{
    return <SearchWindow
        search_window_title="Search for WComponent"
        placeholder="WComponent..."
        selected_option_id={""}
        allow_none={true}
        get_options={() => props.wcomponents.map(wc => ({ id: wc.id, title: wc.title }))}
        on_change={option_id => props.on_change(option_id)}
        on_blur={props.on_blur}
    />
}

export const WComponentSearchWindow = connector(_WComponentSearchWindow) as FunctionalComponent<OwnProps>
