import App from "./App"
import "./index.scss"
import "./shared/utils/monkey_patch"

import { render } from "preact"
import "preact/devtools"
import { Provider } from "react-redux"

import { get_store } from "./state/store"
import { setup_window_on_focus_listener } from "./utils/window_on_focus_listener"
import { set_window_title } from "./window_title/set_window_title"
import { setup_console_api } from "./x_console_api_app/setup_console_api"


const root = document.getElementById("root")


if (root)
{
    root.innerText = ""
    const store = get_store({ load_state_from_storage: true })
    render(<Provider store={store}><App /></Provider>, root)
}


set_window_title()
setup_window_on_focus_listener()
setup_console_api()
