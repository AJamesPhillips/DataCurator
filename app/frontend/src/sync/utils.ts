import { sentence_case } from "../shared/utils/sentence_case";
import type { StorageType } from "../state/sync/state";



export function get_storage_type_name (storage_type: StorageType | undefined)
{
    if (storage_type === undefined) return "None"

    return sentence_case(storage_type.replaceAll("_", " "))
}
