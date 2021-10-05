import { h } from "preact"
import LinkIcon from "@material-ui/icons/Link"
import LinkOffIcon from "@material-ui/icons/LinkOff"

import "./PossibleValueLink.css"
import type { StateValueAndPrediction as VAP } from "../../shared/wcomponent/interfaces/state"
import { AddLinkIcon } from "../../sharedf/icons/AddLink"
import type { ValuePossibilitiesById } from "../../shared/wcomponent/interfaces/possibility"
import { useMemo } from "preact/hooks"



interface OwnProps
{
    editing: boolean
    VAP: VAP
    value_possibilities: ValuePossibilitiesById | undefined

    update_VAP: (VAP: VAP) => void
}


export function PossibleValueLink (props: OwnProps)
{
    const { editing, VAP, value_possibilities, update_VAP } = props

    const value_possibility_ids_by_value = useMemo(() =>
    {
        const value_possibility_ids_by_value: {[value: string]: string} = {}
        Object.values(props.value_possibilities || {})
            .forEach(({ id, value }) => value_possibility_ids_by_value[value.toLowerCase()] = id)

        return value_possibility_ids_by_value
    }, [props.value_possibilities])


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
        <LinkIcon className="hide_on_hover" />
        <LinkOffIcon className="show_on_hover" />
    </span>


    const linkable_value_possibility_id = value_possibility_ids_by_value[VAP.value.toLowerCase()]
    if (linkable_value_possibility_id) return <span
        title="Linkable to value possibility.  Click to link."
        className={"possible_value_link " + (editing ? "clickable" : "disabled")}
        onClick={() =>
        {
            const value_possibility = value_possibilities[linkable_value_possibility_id]!
            const description = value_possibility.description || VAP.description
            const modified_VAP: VAP = {
                ...VAP,
                value_id: linkable_value_possibility_id,
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
