import { h } from "preact"

import "./AutocompleteText.css"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"



export interface AutocompleteProps <E>
{
    allow_editing_when_presenting?: boolean
    disableClearable?: boolean
    label?: string // TODO can remove this now that it always has a "-" in it?
    selected_option?: any | undefined
    onChange?: (e: PointerEvent, option: any) => void
    options: E[]
    // start_expanded?: boolean
}

interface OwnProps <E> extends AutocompleteProps <E> {}

const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props <E> = ConnectedProps<typeof connector> & OwnProps<E>



function _MaterialAutoComplete <E> (props: Props<E>)
{
    return (
        <Autocomplete
            autoComplete={true}
            blurOnSelect={true}
            clearOnBlur={true}
            clearOnEscape={true}
            // debug={true}
            disabled={props.allow_editing_when_presenting ? false : props.presenting}
            disableClearable={props.disableClearable || false}
            disableListWrap={true}
            disablePortal={true}
            freeSolo={false}
            fullWidth={true}
            getOptionLabel={(option: any) => { return option.title || option.id || "none" }}
            //includeInputInList={true}
            onChange={props.onChange || (() => null)}
            openOnFocus={true}
            options={props.options}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    label={props.label || null}
                    placeholder="+"
                />
            )}
            selectOnFocus={true}
            style={{ width: 175 }}
            value={props.selected_option}
        />
    )
}
// <MaterialAutoComplete
//     disableClearable={true}
//     onChange={(e, v) => {
//         const subview_id: string = v.id;
//         if (subview_id) {
//             props.change_route({ args: { subview_id }})
//         }
//     }}
//     options={level.options}
//     selected_option={level.options.find(o => o.id === level.selected_id)}
// />
const ConnectedAutocompleteText = connector(_MaterialAutoComplete)
export function MaterialAutoComplete<E>(props: OwnProps<E>)
{
    return <ConnectedAutocompleteText {...props} />
}
