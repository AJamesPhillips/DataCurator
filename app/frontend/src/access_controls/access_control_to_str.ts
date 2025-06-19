import { ACCESS_CONTROL_LEVEL } from "../supabase/interfaces"


export function access_control_to_str (access_level: ACCESS_CONTROL_LEVEL | undefined): string
{
    const access_description = access_level === "owner" ? "Editor (Owner)"
        : access_level === "editor" ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : "Viewer (public access)"

    return access_description
}
