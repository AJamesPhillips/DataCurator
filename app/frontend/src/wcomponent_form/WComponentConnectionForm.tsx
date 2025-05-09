
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import { sentence_case } from "../shared/utils/sentence_case"
import {
    connection_line_behaviours,
    ConnectionLineBehaviour,
    WComponentConnection,
} from "../wcomponent/interfaces/SpecialisedObjects"



interface OwnProps
{
    wcomponent: WComponentConnection
    editing: boolean
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentConnection>) => void
}



export function WComponentConnectionForm (props: OwnProps)
{
    const {
        wcomponent,
        editing,
        upsert_wcomponent,
    } = props

    const { line_behaviour: orig_line_behaviour } = wcomponent

    return <div>
        {editing && <p>
            <span className="description_label">Line style behaviour</span> &nbsp;
            <AutocompleteText
                selected_option_id={orig_line_behaviour}
                allow_none={true}
                options={options}
                on_change={new_line_behaviour =>
                {
                    upsert_wcomponent({ line_behaviour: new_line_behaviour as ConnectionLineBehaviour })
                }}
            />
        </p>}
    </div>
}


const options: AutocompleteOption[] = connection_line_behaviours.map(id => ({ id, title: sentence_case(id) }))
