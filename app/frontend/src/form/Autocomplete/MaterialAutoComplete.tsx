import { h } from "preact"

import "./AutocompleteText.css"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"

export interface AutocompleteProps <E>
{
    allow_editing_when_presenting?: boolean
    disableClearable?:boolean
    label?: string // TODO can remove this now that it always has a "-" in it?
    selected_option?:any | undefined
    onChange?: (e:PointerEvent, option:any) => void
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
            disabled={props.allow_editing_when_presenting ? false : props.presenting}
            disableClearable={props.disableClearable || false}
            disableListWrap={true}
            disablePortal={true}
            freeSolo={false}
            fullWidth={true}
            getOptionLabel={(option:any) => { return option.title || option.id || "none" }}
            includeInputInList={true}
            onChange={props.onChange || (() => null)}
            options={props.options}
            renderInput={(params) => {
                return (
                    <TextField
                        size="small"
                        {...params}
                        label={props.label || null}
                    />
                )
            }}
            style={{ width: 200 }}
        />
    )
}
const ConnectedAutocompleteText = connector(_MaterialAutoComplete)
export function MaterialAutoComplete<E>(props: OwnProps<E>)
{
    return <ConnectedAutocompleteText {...props} />
}
