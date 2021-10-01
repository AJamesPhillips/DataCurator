import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { ObjectsList } from "../objects/ObjectsList"
import { ObjectForm } from "../objects/ObjectForm"
import { ObjectBulkImport } from "../objects/ObjectBulkImport/ObjectBulkImport"
import { ObjectBulkImportSetup } from "../objects/ObjectBulkImport/ObjectBulkImportSetup"


interface OwnProps {}


const map_state = (state: RootState) => ({
    object: state.objects.find(({ id }) => id === state.routing.item_id),
    show_bulk_import: state.routing.sub_route === "objects_bulk_import",
    show_bulk_import_setup: state.routing.sub_route === "objects_bulk_import/setup",
    object_count: state.objects.length,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _Objects (props: Props)
{
    if (props.show_bulk_import) return <ObjectBulkImport />
    if (props.show_bulk_import_setup) return <ObjectBulkImportSetup />

    return <div>
        <ObjectForm object={props.object}/>
        <hr />
        Objects: {props.object_count}
        <ObjectsList />
    </div>
}


export const Objects = connector(_Objects) as FunctionComponent<OwnProps>
