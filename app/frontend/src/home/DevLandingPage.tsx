import { h } from "preact"
import { Container } from "@mui/material"



export function DevLandingPage() {
    return (
        <Container maxWidth="md">
            <ul>
                <li><a href="/production_landing_page/">Landing page</a></li>
                <li><a href="/app/">app</a></li>
                <li><a href="/sim/">Sim</a></li>
                <li><a href="/data/">Data</a></li>
                <li><a href="/project_dashboard">Project dashboard</a></li>
                <li><a href="/prob_graph">Probability graph</a></li>
                <li><a href="/prob_badge">Probability badge</a></li>
                <li><a href="/sandbox/editable_custom_datetime">Sandbox - EditableCustomDateTime</a></li>
                <li><a href="/sandbox/canvas_nodes">Sandbox - WComponentNode</a></li>
                <li><a href="/sandbox/circular_connections">Sandbox - Circular Connections</a></li>
                <li><a href="/sandbox/supabase">Sandbox - Supabase</a></li>
                <li><a href="/sandbox/connected">Sandbox - Connected</a></li>
                <li><a href="/sandbox">Sandbox</a></li>
            </ul>
        </Container>
    )
}
