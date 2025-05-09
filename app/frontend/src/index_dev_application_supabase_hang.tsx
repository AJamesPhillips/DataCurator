import { render } from "preact"

import { DemoSupabaseAuthHang } from "./scratch_pad/DemoSupabaseAuthHang"


const root = document.getElementById("root")

if (root)
{
    root.innerText = ""

    render(<DemoSupabaseAuthHang />, root)
}
