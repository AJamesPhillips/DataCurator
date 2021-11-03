import { h } from "preact"
import { useMemo } from "preact/hooks"
import LinkOffIcon from "@material-ui/icons/LinkOff"

import "./ValuePossibilityLink.css"
import type { StateValueAndPrediction as VAP } from "../../wcomponent/interfaces/state"
import { AddLinkIcon } from "../../sharedf/icons/AddLinkIcon"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import { LinkWorkingIcon } from "../../sharedf/icons/LinkWorkingIcon"
import {
    get_value_possibilities_by_value,
} from "../../wcomponent/value_possibilities/get_value_possibilities_by_value"



interface OwnProps
{
    editing: boolean
    VAP: VAP
    value_possibilities: ValuePossibilitiesById | undefined

    update_VAP: (VAP: VAP) => void
}


export function ValuePossibilityLink (props: OwnProps)
{
    const { editing, VAP, value_possibilities, update_VAP } = props

    const value_possibilities_by_value = useMemo(() =>
        get_value_possibilities_by_value(props.value_possibilities, true)
    , [props.value_possibilities])


    if (value_possibilities === undefined) return <span
        title="Need to first add value possibilities to link to."
        className="possible_value_link disabled"
    >
        <LinkOffIcon />
    </span>


    const value_possibility_linked = !!(value_possibilities[VAP.value_id || ""])
    if (value_possibility_linked) return <span
        title="Linked to possible value.  Click to unlink."
        className={"possible_value_link " + (editing ? "clickable" : "disabled")}
        onClick={() =>
        {
            const modified_VAP = {...VAP}
            delete modified_VAP.value_id
            update_VAP(modified_VAP)
        }}
    >
        <LinkWorkingIcon className="hide_on_hover" />
        <LinkOffIcon className="show_on_hover" />
    </span>


    const linkable_value_possibility = value_possibilities_by_value[VAP.value.toLowerCase()]
    if (linkable_value_possibility) return <span
        title="Linkable to value possibility.  Click to link."
        className={"possible_value_link " + (editing ? "clickable" : "disabled")}
        onClick={() =>
        {
            const value_possibility = value_possibilities[linkable_value_possibility.id]!
            const description = value_possibility.description || VAP.description
            const modified_VAP: VAP = {
                ...VAP,
                value_id: linkable_value_possibility.id,
                description,
            }
            update_VAP(modified_VAP)
        }}
    >
        <AddLinkIcon />
    </span>


    return <span
        title="No matching value possibility to link to."
        className="possible_value_link disabled"
    >
        <LinkOffIcon />
    </span>
}
