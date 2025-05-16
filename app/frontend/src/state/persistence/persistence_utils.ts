

type SupportedPersistenceKeys = (
    "display_options"
    | "filter_context"
    | "controls"
    | "search"
    | "sync"
    | "user_info"

    | "experimental_features"
)


export function persist_state_object (key: SupportedPersistenceKeys, obj: object)
{
    localStorage.setItem("persisted_" + key, JSON.stringify(obj))
}



export function get_persisted_state_object <O> (key: SupportedPersistenceKeys): Partial<O>
{
    try
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(localStorage.getItem("persisted_" + key) || "{}")
    }
    catch (e)
    {
        return {}
    }
}
