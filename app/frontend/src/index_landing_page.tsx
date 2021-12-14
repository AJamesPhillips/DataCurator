import "./shared/utils/monkey_patch"
import "./index.scss"

import { h, render } from "preact"
import "preact/devtools"

import { LandingPage } from "./home/LandingPage"
import { set_window_title } from "./window_title/set_window_title"

const root = document.getElementById("root")


if (root)
{
    root.innerText = ""
    render(<LandingPage />, root)
}


set_window_title()
