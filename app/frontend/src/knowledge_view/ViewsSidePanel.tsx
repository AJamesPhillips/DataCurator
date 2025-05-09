
import { Box } from "@mui/material"
import { KnowledgeViewForm } from "./KnowledgeViewForm"
import { TopLevelKnowledgeViewListsSet } from "./TopLevelKnowledgeViewListsSet"



export function ViewsSidePanel(props: {}) {
    return (
        <Box p={1} pt={5} class="views_side_panel">
            Current View:
            <KnowledgeViewForm />
            <br />
            <br />
            <br />
            <br />
            <br />
            <TopLevelKnowledgeViewListsSet />
        </Box>
    )
}
