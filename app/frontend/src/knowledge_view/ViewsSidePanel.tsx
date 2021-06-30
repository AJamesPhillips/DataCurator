import { h } from "preact"

import { TopLevelKnowledgeViewListsSet } from "./TopLevelKnowledgeViewListsSet"
import { Box } from "@material-ui/core"



export function ViewsSidePanel(props: {}) {
    return (
        <Box p={1} pt={5} class="views_side_panel">
            <TopLevelKnowledgeViewListsSet />
        </Box>
    )
}
