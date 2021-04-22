import { Server } from "@hapi/hapi"
import { writeFileSync, existsSync, mkdirSync } from "fs"

import { LOG_TAGS } from "../../../shared/constants"
import { GetFieldTextArgs, get_title, get_description } from "../../../shared/models/get_rich_text"
import {
    SpecialisedObjectsFromToServer,
    specialised_objects_from_to_server_expected_keys,
    Perception,
    WComponent,
    KnowledgeView,
    WComponentsById,
} from "../../../shared/models/interfaces/SpecialisedObjects"




interface OutputLatestSpecialisedStateAsMarkdownArgs
{
    data: SpecialisedObjectsFromToServer
    output_markdown_directory: string
    server: Server
}
export function output_latest_specialised_state_as_markdown(args: OutputLatestSpecialisedStateAsMarkdownArgs) {
    const {
        data,
        output_markdown_directory,
        server,
    } = args

    specialised_objects_from_to_server_expected_keys.forEach(data_key =>
    {
        if (!data[data_key]) server.log(LOG_TAGS.EXCEPTION, `Missing key "${data_key}" to save`)
        else
        {
            const files_data = data[data_key]
            const directory_path = output_markdown_directory + data_key + "/"
            ensure_directory(directory_path)
            write_directory_data(directory_path, files_data, data_key)
        }
    })
}



function ensure_directory(directory_path: string) {
    if (!existsSync(directory_path))
    {
        mkdirSync(directory_path, { recursive: true })
    }
}



function write_directory_data (directory: string, data: (Perception | WComponent | KnowledgeView)[], data_key: keyof SpecialisedObjectsFromToServer)
{
    const wcomponents_by_id: WComponentsById = {}
    if (data_key === "wcomponents")
    {
        data.forEach(wcomponent =>
        {
            wcomponents_by_id[wcomponent.id] = wcomponent as any
        })
    }

    data.map(single_data =>
    {
        let file_contents_str = ""
        try {
            file_contents_str = get_file_contents_str({ single_data, data_key, wcomponents_by_id })
        }
        catch (e)
        {
            console.error(e)
            return
        }

        const file_path = directory + single_data.id + ".md"
        writeFileSync(file_path, file_contents_str)
    })
}



interface GetFileContentsStrArgs
{
    single_data: Perception | WComponent | KnowledgeView
    data_key: keyof SpecialisedObjectsFromToServer
    wcomponents_by_id: WComponentsById
}
function get_file_contents_str(args: GetFileContentsStrArgs) {
    const { single_data, data_key, wcomponents_by_id } = args

    const data_str = JSON.stringify(single_data, null, 1)

    let title = single_data.title
    let description = single_data.description

    if (data_key === "wcomponents")
    {
        const args: GetFieldTextArgs = {
            wcomponent: single_data as any,
            wcomponents_by_id,
            rich_text: true,
            root_url: "http://localhost:8080/app",
        }
        title = get_title(args) || ""
        description = get_description(args) || ""
    }

    const file_contents_str = `---\n${data_str}\n---\n${title}\n\n${description}`

    return file_contents_str
}
