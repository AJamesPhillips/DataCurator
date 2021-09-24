import { h } from "preact"

import "./StorageOption.scss"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"



interface OwnProps
{
    base: SupabaseKnowledgeBaseWithAccess
    selected: boolean
    on_click: () => void
}


export function StorageOption (props: OwnProps)
{
    const { base, selected } = props

    return <div
        className={"section storage_option " + (selected ? "selected" : "") }
        onClick={props.on_click}
    >
        <h3>{base.title || "(No title)"}</h3>

        id: {base.id}
    </div>
}
