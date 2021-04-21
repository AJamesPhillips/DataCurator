import { Server } from "@hapi/hapi"
import { writeFileSync } from "fs"

import { LOG_TAGS } from "../../../shared/constants"
import {
    SpecialisedObjectsFromToServer,
    SpecialisedObjectsFromToServerKeys,
    specialised_objects_from_to_server_expected_keys,
} from "../../../shared/models/SpecialisedObjects"



export function save_latest_specialised_state (to_save: SpecialisedObjectsFromToServer, server: Server)
{

    specialised_objects_from_to_server_expected_keys.forEach(data_key =>
    {
        if (!to_save[data_key]) server.log(LOG_TAGS.EXCEPTION, `Missing key "${data_key}" to save`)
        else
        {
            const files_data = to_save[data_key]
            const directory_path = data_key_to_directory_path(data_key)
            write_directory_data(directory_path, files_data)
        }
    })
}



const wcomponents_directory = `./state_backup/wcomponents/`
const perceptions_directory = `./state_backup/perceptions/`
const knowledge_views_directory = `./state_backup/knowledge_views/`
function data_key_to_directory_path (data_key: SpecialisedObjectsFromToServerKeys): string
{
    if (data_key === "perceptions") return perceptions_directory
    if (data_key === "wcomponents") return wcomponents_directory
    if (data_key === "knowledge_views") return knowledge_views_directory

    throw new Error(`Unsupported data_key: "${data_key}"`)
}



function write_directory_data (directory: string, data: { id: string }[])
{
    data.map(single_data =>
    {
        const file_path = directory + single_data.id + ".json"
        const data_str = JSON.stringify(single_data, null, 1)
        writeFileSync(file_path, data_str)
    })
}

