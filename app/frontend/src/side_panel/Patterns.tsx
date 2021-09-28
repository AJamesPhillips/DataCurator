import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { EditPatternForm } from "../patterns/EditPatternForm"
import { PatternsList } from "../patterns/PatternsList"
import { NewPatternForm } from "../patterns/NewPatternForm"
import { Box, Divider, Typography } from "@material-ui/core"


interface OwnProps {}


const map_state = (state: RootState) => ({
    pattern: state.patterns.find(({ id }) => id === state.routing.item_id),
    pattern_count: state.patterns.length,
})

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _Patterns (props: Props)
{
    if (props.pattern)
    {
        return <div>
            <EditPatternForm pattern={props.pattern} />
        </div>
    }

    return (
        <Box>
            <Typography component="h2" gutterBottom>
                Add patterns
            </Typography>
            <NewPatternForm />
            <Typography component="h3" my={3}>
                Patterns: {props.pattern_count}
            </Typography>
            <PatternsList />
        </Box>
    )
}

export const Patterns = connector(_Patterns) as FunctionComponent<OwnProps>