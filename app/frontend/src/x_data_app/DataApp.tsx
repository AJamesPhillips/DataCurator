import { h } from "preact"
import { useState } from "preact/hooks"

import { GenericData } from "./generic_data/GenericData"
import { Spaces } from "./spaces/Spaces"



export function DataApp ()
{
    const [view, set_view] = useState<"spaces" | "generic_data">("generic_data")

    const view_spaces = view === "spaces"
    const view_generic_data = view === "generic_data"


    return <div>
        <div>
            {/* <button
                onClick={() => set_view("spaces")}
                style={{ backgroundColor: view_spaces ? "white" : "" }}
            >
                Spaces
            </button> */}
            <button
                onClick={() => set_view("generic_data")}
                style={{ backgroundColor: view_generic_data ? "white" : "" }}
            >
                Data
            </button>
        </div>
        <br />

        {/* {view_spaces && <Spaces />} */}
        {view_generic_data && <GenericData />}
    </div>
}
