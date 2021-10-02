


type Listener = () => void

const window_on_focus_listeners: Listener[] = []
export function setup_window_on_focus_listener ()
{
    // Possibly use this API instead https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    window.addEventListener("focus", function ()
    {
        window_on_focus_listeners.forEach(listener => listener())
    }, false)
}



export function register_window_on_focus_listener (listener: Listener)
{
    window_on_focus_listeners.push(listener)
}
