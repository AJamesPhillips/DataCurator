import { TextField } from "@mui/material"
import { h } from "preact"

import { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"


interface OwnProps
{
    wcomponent: WComponent
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}

export function WComponentImageForm(props: OwnProps)
{
    const { wcomponent, upsert_wcomponent } = props
    const summary_image = wcomponent.summary_image || undefined

    // http://upload.wikimedia.org/wikipedia/commons/e/ec/Short-horned_chameleon_%28Calumma_brevicorne%29_female_Andasibe.jpg
    return (
        <TextField
            fullWidth={true}
            label="Summary Image URL"
            onChange={(e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const url: string | undefined = e.target?.value ?? undefined
                if (url !== undefined) {
                    upsert_wcomponent({ summary_image: url })
                }
            }}
            value={summary_image}
            variant="outlined"
        />
    )
}
