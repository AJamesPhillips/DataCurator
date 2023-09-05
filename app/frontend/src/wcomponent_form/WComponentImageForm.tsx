import { Box, FormControl, FormControlLabel, TextField } from "@mui/material"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { WComponent } from "src/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "src/state/State"
interface OwnProps
{
    wcomponent: WComponent
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}

const map_state = (state: RootState) => ({
    creation_context_state: state.creation_context,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

export function _WComponentImageForm(props: Props)
{
    const { wcomponent, upsert_wcomponent } = props;
    const summary_image = wcomponent.summary_image || undefined;

    // http://upload.wikimedia.org/wikipedia/commons/e/ec/Short-horned_chameleon_%28Calumma_brevicorne%29_female_Andasibe.jpg
    return (
        <TextField
            fullWidth={true}
            label="Summary Image URL"
            onChange={(e: any) => {
                let url = (e.target?.value) ? e.target?.value : null
                if (url !== undefined) {
                    upsert_wcomponent({ summary_image: url })
                }
            }}
            value={summary_image}
            variant="outlined"
        />
    )
}

export const WComponentImageForm = connector(_WComponentImageForm) as FunctionalComponent<OwnProps>
