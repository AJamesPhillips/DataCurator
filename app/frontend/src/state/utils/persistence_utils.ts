

type SupportedPersistenceKeys = "display_options" | "creation_context" | "filter_context" | "controls"


export function persist_state_object (key: SupportedPersistenceKeys, obj: object)
{
    localStorage.setItem("persisted_" + key, JSON.stringify(obj))
}



export function get_persisted_state_object <O> (key: SupportedPersistenceKeys): Partial<O>
{
    try
    {
        return JSON.parse(localStorage.getItem("persisted_" + key) || "{}")
    }
    catch (e)
    {
        return {}
    }
}
