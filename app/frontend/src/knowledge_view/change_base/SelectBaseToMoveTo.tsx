import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../../form/Autocomplete/interfaces"

import type { RootState } from "../../state/State"



interface OwnProps
{
    base_id_to_move_to: number | undefined
    on_change: (new_base_id_to_move_to: number | undefined) => void
}


const map_state = (state: RootState) =>
({
    bases_by_id: state.user_info.bases_by_id,
    chosen_base_id: state.user_info.chosen_base_id,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SelectBaseToMoveTo (props: Props)
{
    const selected_option_id = props.base_id_to_move_to === undefined ? undefined : `${props.base_id_to_move_to}`
    const options_of_other_editable_bases: AutocompleteOption[] = Object.values(props.bases_by_id || {})
        .filter(b => b.id !== props.chosen_base_id)
        .filter(b => b.access_level === "editor" || b.access_level === "owner")
        .map(base => ({ id: `${base.id}`, title: base.title }))

    return <div>
        <AutocompleteText
            selected_option_id={selected_option_id}
            allow_none={true}
            options={options_of_other_editable_bases}
            on_change={new_base_id_to_move_to_str =>
            {
                const new_base_id_to_move_to = new_base_id_to_move_to_str === undefined ? undefined : parseInt(new_base_id_to_move_to_str)
                props.on_change(new_base_id_to_move_to)
            }}
        />
    </div>
}

export const SelectBaseToMoveTo = connector(_SelectBaseToMoveTo) as FunctionalComponent<OwnProps>
