import { SupportedPersistenceKeys } from "./persistence/persistence_utils"


export interface DependenciesForGettingStartingState
{
    get_date: () => Date
    get_url: () => string
    get_url_hash: () => string
    get_persisted_state_object: <O> (key: SupportedPersistenceKeys) => Partial<O>
}
